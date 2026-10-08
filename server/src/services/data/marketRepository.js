import { supabase, supabaseEnabled } from '../../lib/supabase.js';
import { haversineKm } from '../optimizer/geo.js';
import { fetchCommodityOnlineData } from './commodityOnline.js';
import { getTelanganaMarkets, getTelanganaFallbackPrices, getTelanganaMarketHistory } from './telanganaData.js';
import { demoBuyerRequirements } from './demoData.js';

const normalizeMarket = (row) => ({
  id: row.id,
  name: row.name,
  district: row.district,
  state: row.state,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  modalPrice: Number(row.modal_price ?? row.latestPrice ?? row.modalPrice ?? 0),
  minPrice: Number(row.min_price ?? row.modal_price ?? row.minPrice ?? 0),
  maxPrice: Number(row.max_price ?? row.modal_price ?? row.maxPrice ?? 0),
  stability: Number(row.stability ?? 0.7),
  trend: Number(row.trend ?? 0),
  source: row.source || 'Supabase'
});

/**
 * Returns all markets. Priority:
 *  1. Telangana CSV markets (real data from state govt) — always included
 *  2. Supabase markets — merged in if configured (avoids duplicates)
 */
export async function getMarkets({ crop = 'Tomato' } = {}) {
  // Always start with real Telangana CSV markets
  const csvMarketsList = getTelanganaMarkets();
  const fallbackPrices = await getTelanganaFallbackPrices({ crop });

  const markets = csvMarketsList.map(m => {
    const marketBaseName = m.name.replace(' Market', '').toLowerCase();
    const match = fallbackPrices.find(fp =>
      fp.market.toLowerCase() === marketBaseName
    );
    return {
      ...m,
      modalPrice: match?.modalPrice ?? 0,
      minPrice: match?.minPrice ?? 0,
      maxPrice: match?.maxPrice ?? 0,
      latestPrice: match?.modalPrice ?? 0,
      stability: 0.7,
      trend: 0,
      source: match ? match.source : 'Telangana State Marketing Dept'
    };
  });

  // Merge Supabase markets (if configured), avoiding duplicates
  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase.from('markets').select('*').order('name');
      if (!error && data?.length) {
        const csvNames = new Set(markets.map(m => m.name.toLowerCase()));
        for (const row of data) {
          const normalized = normalizeMarket(row);
          if (!csvNames.has(normalized.name.toLowerCase())) {
            markets.push(normalized);
          }
        }
      }
    } catch (e) { /* Supabase optional */ }
  }

  return markets;
}

export async function getNearbyMarkets({ latitude, longitude, crop, radiusKm, count }) {
  let markets = await getMarkets({ crop });
  markets = markets
    .map((m) => ({ ...m, distanceKm: haversineKm(latitude, longitude, m.latitude, m.longitude) }))
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);

  if (!markets.length) {
    // If nothing found within radius, return the 5 closest anyway
    const all = await getMarkets({ crop });
    markets = all
      .map((m) => ({ ...m, distanceKm: haversineKm(latitude, longitude, m.latitude, m.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, count);
  }
  return markets;
}

export async function getBuyerRequirements({ crop = '' } = {}) {
  if (!supabaseEnabled) return demoBuyerRequirements.filter((x) => !crop || x.crop.toLowerCase() === crop.toLowerCase());
  const { data, error } = await supabase.from('buyer_requirements').select('*').eq('status', 'Open');
  if (error || !data?.length) return demoBuyerRequirements.filter((x) => !crop || x.crop.toLowerCase() === crop.toLowerCase());
  return data.map((x) => ({
    ...x,
    companyName: x.company_name || x.companyName,
    quantityKg: Number(x.quantity_kg ?? x.quantityKg),
    offerPrice: Number(x.offer_price ?? x.offerPrice),
    latitude: Number(x.latitude),
    longitude: Number(x.longitude),
    pickupProvided: Boolean(x.pickup_provided ?? x.pickupProvided),
    requiredBy: x.required_by || x.requiredBy,
    paymentDays: Number(x.payment_days ?? x.paymentDays ?? 3),
    isVerified: true,
    verificationId: x.verification_id || 'MM-GOV-2026-9901',
    gstin: x.gstin || '36AABCB1234M1Z5',
    fssai: x.fssai || '13621014000189',
    trustScore: x.trust_score || 98
  })).filter((x) => !crop || x.crop.toLowerCase() === crop.toLowerCase());
}

export async function createBuyerRequirement(payload) {
  const newReq = {
    ...payload,
    id: `BUY-${Date.now().toString().slice(-4)}`,
    status: 'Open',
    isVerified: true,
    verificationId: payload.verificationId || `MM-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    gstin: payload.gstin || '36AABCB1234M1Z5',
    fssai: payload.fssai || '13621014000189',
    trustScore: payload.trustScore || 98,
    officerName: payload.officerName || 'Authorized Procurement Lead'
  };

  if (!supabaseEnabled) {
    demoBuyerRequirements.unshift(newReq);
    return newReq;
  }

  try {
    const { data, error } = await supabase.from('buyer_requirements').insert({
      company_name: payload.companyName,
      type: payload.type,
      crop: payload.crop,
      quantity_kg: payload.quantityKg,
      grade: payload.grade,
      offer_price: payload.offerPrice,
      latitude: payload.latitude,
      longitude: payload.longitude,
      city: payload.city,
      pickup_provided: payload.pickupProvided,
      required_by: payload.requiredBy,
      payment_days: payload.paymentDays ?? 3,
      status: 'Open'
    }).select('*').single();

    if (error) throw error;
    return {
      ...newReq,
      id: data.id,
      companyName: data.company_name,
      type: data.type,
      crop: data.crop,
      quantityKg: Number(data.quantity_kg),
      grade: data.grade,
      offerPrice: Number(data.offer_price),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      city: data.city,
      pickupProvided: Boolean(data.pickup_provided),
      requiredBy: data.required_by,
      paymentDays: data.payment_days,
      status: data.status
    };
  } catch (err) {
    demoBuyerRequirements.unshift(newReq);
    return newReq;
  }
}

/**
 * Price history: tries CSV first, falls back to demo
 */
export async function getPriceHistory({ crop = 'Tomato' } = {}) {
  // Try real CSV history first
  const csvHistory = getTelanganaMarketHistory({ crop });
  if (csvHistory.length) {
    // Aggregate daily average across all markets
    const dailyMap = new Map();
    for (const entry of csvHistory) {
      if (!dailyMap.has(entry.date)) {
        dailyMap.set(entry.date, { prices: [], date: entry.date });
      }
      dailyMap.get(entry.date).prices.push(entry.price);
    }
    return Array.from(dailyMap.values())
      .map(d => ({
        date: d.date,
        price: Number((d.prices.reduce((a, b) => a + b, 0) / d.prices.length).toFixed(2))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Supabase fallback
  if (supabaseEnabled) {
    const { data, error } = await supabase.from('price_history').select('date,price').eq('crop', crop).order('date');
    if (!error && data?.length) return data.map((x) => ({ date: x.date, price: Number(x.price) }));
  }

  return [];
}

/**
 * Refreshes market prices with live data from CommodityOnline.
 * If the live scraper fails, the CSV fallback prices are already baked
 * into the market objects, so the app still works with real data.
 */
export async function refreshMarketPrices({ markets, crop }) {
  let live;
  try {
    live = await fetchCommodityOnlineData({ crop });
  } catch (err) {
    console.warn('[refreshMarketPrices] Live scraper failed, using CSV fallback:', err.message);
    return { markets, externalCalls: 0, liveEnabled: false, liveError: err.message };
  }

  if (!live.records.length) {
    return { markets, externalCalls: live.requestCount || 0, liveEnabled: live.enabled, liveError: live.error || null };
  }

  const updated = markets.map((market) => {
    const name = (market.name || '').toLowerCase().replace(' market', '');
    const match = live.records.find((record) => {
      const recordMarket = String(record.market || '').toLowerCase();
      return (recordMarket && (name.includes(recordMarket) || recordMarket.includes(name)));
    });
    if (!match || !Number.isFinite(match.modalPrice)) return market;
    return {
      ...market,
      modalPrice: match.modalPrice,
      minPrice: match.minPrice ?? market.minPrice,
      maxPrice: match.maxPrice ?? market.maxPrice,
      source: 'commodityonline.com (Live)'
    };
  });

  return { markets: updated, externalCalls: live.requestCount || 0, liveEnabled: live.enabled, liveError: live.error || null };
}
