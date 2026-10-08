import { supabase, supabaseEnabled } from '../../lib/supabase.js';
import { demoMarkets, demoBuyerRequirements, demoPriceHistory } from './demoData.js';
import { haversineKm } from '../optimizer/geo.js';
import { fetchGovernmentMarketData } from './dataGov.js';

const normalizeMarket = (row) => ({
  id: row.id,
  name: row.name,
  district: row.district,
  state: row.state,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  modalPrice: Number(row.modal_price ?? row.latestPrice ?? 0),
  minPrice: Number(row.min_price ?? row.modal_price ?? 0),
  maxPrice: Number(row.max_price ?? row.modal_price ?? 0),
  stability: Number(row.stability ?? 0.7),
  trend: Number(row.trend ?? 0),
  source: row.source || 'Supabase'
});

export async function getMarkets() {
  if (!supabaseEnabled) return demoMarkets;
  const { data, error } = await supabase.from('markets').select('*').order('name');
  if (error || !data?.length) return demoMarkets;
  return data.map(normalizeMarket);
}

export async function getNearbyMarkets({ latitude, longitude, crop, radiusKm, count }) {
  let markets = await getMarkets();
  markets = markets
    .map((m) => ({ ...m, distanceKm: haversineKm(latitude, longitude, m.latitude, m.longitude) }))
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);

  if (!markets.length) {
    markets = demoMarkets
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
    quantityKg: Number(x.quantity_kg),
    offerPrice: Number(x.offer_price),
    latitude: Number(x.latitude),
    longitude: Number(x.longitude),
    pickupProvided: Boolean(x.pickup_provided)
  })).filter((x) => !crop || x.crop.toLowerCase() === crop.toLowerCase());
}

export async function createBuyerRequirement(payload) {
  if (!supabaseEnabled) return { ...payload, id: `DEMO-${Date.now()}`, status: 'Open' };
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
}

export async function getPriceHistory({ crop = 'Tomato' } = {}) {
  if (!supabaseEnabled) return demoPriceHistory;
  const { data, error } = await supabase.from('price_history').select('date,price').eq('crop', crop).order('date');
  if (error || !data?.length) return demoPriceHistory;
  return data.map((x) => ({ date: x.date, price: Number(x.price) }));
}


export async function refreshMarketPrices({ markets, crop }) {
  const live = await fetchGovernmentMarketData({ crop, limit: 100 });
  if (!live.records.length) return { markets, externalCalls: live.requestCount || 0, liveEnabled: live.enabled, liveError: live.error || null };
  const updated = markets.map((market) => {
    const name = market.name.toLowerCase();
    const district = market.district.toLowerCase();
    const match = live.records.find((record) => {
      const recordMarket = String(record.market || '').toLowerCase();
      const recordDistrict = String(record.district || '').toLowerCase();
      return (recordMarket && (name.includes(recordMarket) || recordMarket.includes(name))) ||
        (recordDistrict && recordDistrict === district);
    });
    if (!match || !Number.isFinite(match.modalPrice)) return market;
    return { ...market, modalPrice: match.modalPrice, minPrice: match.minPrice ?? market.minPrice, maxPrice: match.maxPrice ?? market.maxPrice, source: 'data.gov.in / AGMARKNET' };
  });
  return { markets: updated, externalCalls: live.requestCount || 0, liveEnabled: live.enabled, liveError: live.error || null };
}
