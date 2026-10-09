/**
 * Telangana Market Data — parsed from the official Telangana State Marketing
 * Department CSV (day_prices_between_01-08-2026_31-08-2026.csv).
 *
 * This module provides:
 *  1. A geo-coded list of all 35 real Telangana markets (yards) with lat/lng.
 *  2. The latest-per-(market, commodity) prices from the CSV as fallback data.
 *  3. A full list of 87 commodities traded across these markets.
 *
 * Prices in the CSV are in Rs per Quintal (100 kg). We convert to Rs/Kg
 * for consistency with the rest of the app.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Geo-coordinates for each YardCode ──────────────────────────────────────
// Manually mapped from Google Maps for Telangana markets
const YARD_GEO = {
  '1327': { lat: 16.55, lng: 78.07, district: 'Nagarkurnool' },        // Badepally
  '11':   { lat: 19.10, lng: 77.96, district: 'Nirmal' },               // Bhainsa
  '12':   { lat: 19.44, lng: 78.45, district: 'Adilabad' },             // Boath
  '3':    { lat: 17.48, lng: 78.46, district: 'Hyderabad' },            // Bowenpally
  '1123': { lat: 18.54, lng: 79.17, district: 'Karimnagar' },           // Choppadandi
  '1352': { lat: 16.12, lng: 77.58, district: 'Mahbubnagar' },          // Devarakadra
  '1215': { lat: 17.87, lng: 78.12, district: 'Siddipet' },             // Dubbak
  '1':    { lat: 17.35, lng: 78.54, district: 'Rangareddy' },           // Gaddiannaram
  '2':    { lat: 17.35, lng: 78.55, district: 'Rangareddy' },           // L.B Nagar
  '1328': { lat: 16.23, lng: 77.80, district: 'Jogulamba Gadwal' },     // Gadwal
  '1571': { lat: 17.39, lng: 78.45, district: 'Hyderabad' },            // Gudimalkapur
  '5':    { lat: 17.38, lng: 78.47, district: 'Hyderabad' },            // Mahabubmansion
  '6':    { lat: 17.37, lng: 78.48, district: 'Hyderabad' },            // Madannapeta
  '7':    { lat: 17.40, lng: 78.44, district: 'Hyderabad' },            // Meeralamandi
  '1125': { lat: 18.79, lng: 78.91, district: 'Jagtial' },              // Jagtial
  '26':   { lat: 19.07, lng: 78.27, district: 'Adilabad' },             // Jainath
  '36':   { lat: 18.30, lng: 79.21, district: 'Karimnagar' },           // Jammikunta
  '1208': { lat: 17.72, lng: 77.83, district: 'Sangareddy' },           // Jogipet
  '1340': { lat: 16.58, lng: 78.39, district: 'Nagarkurnool' },         // Kalwakurthy
  '1168': { lat: 17.80, lng: 79.93, district: 'Warangal' },             // Kesamudram
  '1067': { lat: 17.25, lng: 80.15, district: 'Khammam' },              // Khammam
  '1177': { lat: 17.60, lng: 80.00, district: 'Mahabubabad' },          // Mahabubabad
  '1326': { lat: 16.74, lng: 77.98, district: 'Mahbubnagar' },          // Mahaboobnagar
  '1334': { lat: 16.48, lng: 78.32, district: 'Nagarkurnool' },         // Nagarkurnool
  '1342': { lat: 16.73, lng: 77.50, district: 'Narayanpet' },           // Narayanpet
  '1080': { lat: 18.67, lng: 78.10, district: 'Nizamabad' },            // Nizamabad
  '1330': { lat: 17.06, lng: 78.20, district: 'Rangareddy' },           // Shadnagar
  '1091': { lat: 17.14, lng: 79.62, district: 'Suryapet' },             // Suryapet
  '37':   { lat: 17.25, lng: 77.58, district: 'Vikarabad' },            // Tandur
  '9':    { lat: 17.05, lng: 79.49, district: 'Nalgonda' },             // Tirmalagiri
  '1612': { lat: 17.54, lng: 78.37, district: 'Medchal' },              // Vantimamidi
  '1106': { lat: 17.05, lng: 79.27, district: 'Nalgonda' },             // V Nagar
  '1344': { lat: 16.36, lng: 78.06, district: 'Wanaparthy' },           // W.P.Town
  '886':  { lat: 18.00, lng: 79.59, district: 'Hanamkonda' },           // Warangal
  '1198': { lat: 17.68, lng: 77.60, district: 'Sangareddy' },           // Zaheerabad
};

// ─── Parse the CSV ──────────────────────────────────────────────────────────
let csvParsed = false;
let csvMarkets = [];        // unique markets with geo
let csvLatestPrices = {};   // key: "YardCode|CommName" → latest row
let csvAllRecords = [];     // all rows

function ensureParsed() {
  if (csvParsed) return;
  csvParsed = true;

  try {
    const csvPath = join(__dirname, '..', '..', 'data', 'optimized_market_prices.csv');
    const raw = readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',');

    const yardsMap = new Map();

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row = {};
      headers.forEach((h, idx) => { row[h.trim()] = (cols[idx] || '').trim(); });

      csvAllRecords.push(row);

      // Track latest price per yard+commodity
      const key = `${row.yard_code}|${row.commodity}`;
      if (!csvLatestPrices[key] || row.date > csvLatestPrices[key].date) {
        csvLatestPrices[key] = row;
      }

      // Build unique yards
      if (!yardsMap.has(row.yard_code)) {
        yardsMap.set(row.yard_code, {
          id: `TS-${row.yard_code}`,
          name: `${row.yard_name} Market`,
          amcName: row.yard_name,
          district: 'Telangana', // Fallback district if needed
          state: 'Telangana',
          latitude: parseFloat(row.latitude) || 17.38,
          longitude: parseFloat(row.longitude) || 78.48,
          yardCode: row.yard_code,
          source: 'Telangana State Marketing Dept'
        });
      }
    }

    csvMarkets = Array.from(yardsMap.values());
    console.log(`[telanganaData] Loaded ${csvAllRecords.length} rows, ${csvMarkets.length} markets, ${Object.keys(csvLatestPrices).length} latest price entries`);
  } catch (err) {
    console.error('[telanganaData] Failed to parse CSV:', err.message);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns all unique Telangana markets with geo-coordinates
 */
export function getTelanganaMarkets() {
  ensureParsed();
  return csvMarkets;
}

import { supabase, supabaseEnabled } from '../../lib/supabase.js';

// In-memory cache for ultra-fast response times (5-minute TTL)
const dbCache = {
  commodities: null,
  commoditiesAt: 0,
  markets: null,
  marketsAt: 0,
  pricesByCrop: new Map(),
  historyByCrop: new Map()
};

const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Returns the latest prices for a given commodity across all markets from Supabase.
 * Prices are converted from Rs/Quintal to Rs/Kg.
 * @param {string} crop - The commodity name (e.g. "Tomato", "Onions")
 * @returns {Array} - [{market, YardCode, latitude, longitude, district, state, commodity, variety, modalPrice, minPrice, maxPrice, date, source}]
 */
export async function getTelanganaFallbackPrices({ crop = 'Tomato' } = {}) {
  const cleanCrop = (crop || 'Tomato').trim();
  const cacheKey = cleanCrop.toLowerCase();

  const cached = dbCache.pricesByCrop.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (supabaseEnabled) {
    try {
      let { data, error } = await supabase
        .from('telangana_market_prices')
        .select('*')
        .ilike('commodity', `%${cleanCrop}%`);

      if (!data || data.length === 0) {
        const res2 = await supabase
          .from('telangana_market_prices')
          .select('*')
          .ilike('commodity', `${cleanCrop}%`);
        data = res2.data;
      }

      if (data && data.length > 0) {
        // Group by yard_code and keep the latest date record for each market
        const latestByYard = new Map();
        for (const row of data) {
          const yCode = row.yard_code || row.YardCode;
          if (!latestByYard.has(yCode) || row.date > latestByYard.get(yCode).date) {
            latestByYard.set(yCode, row);
          }
        }

        const formatted = Array.from(latestByYard.values()).map(row => {
          const yardCode = row.yard_code || row.YardCode;
          const geo = YARD_GEO[yardCode] || {};
          const lat = Number(row.latitude) || geo.lat || 17.38;
          const lng = Number(row.longitude) || geo.lng || 78.48;
          const district = geo.district || 'Telangana';

          return {
            market: row.yard_name || row.YardName,
            YardCode: yardCode,
            latitude: lat,
            longitude: lng,
            district,
            state: 'Telangana',
            commodity: row.commodity || cleanCrop,
            variety: row.variety || 'Common',
            modalPrice: parseFloat(row.modal_price || 0) / 100, // Rs/Quintal to Rs/Kg
            minPrice: parseFloat(row.min_price || 0) / 100,
            maxPrice: parseFloat(row.max_price || 0) / 100,
            date: row.date,
            source: 'Supabase (telangana_market_prices)'
          };
        });

        dbCache.pricesByCrop.set(cacheKey, { data: formatted, timestamp: Date.now() });
        return formatted;
      }
    } catch (e) {
      console.warn('[telanganaData] Supabase price fetch failed:', e.message);
    }
  }

  // Graceful fallback to local loaded CSV only if database is completely offline
  ensureParsed();
  const results = [];
  const lowerCrop = cleanCrop.toLowerCase();

  for (const row of Object.values(csvLatestPrices)) {
    if (row.commodity && row.commodity.toLowerCase().includes(lowerCrop)) {
      const geo = YARD_GEO[row.yard_code] || {};
      results.push({
        market: row.yard_name,
        YardCode: row.yard_code,
        latitude: parseFloat(row.latitude) || geo.lat || 17.38,
        longitude: parseFloat(row.longitude) || geo.lng || 78.48,
        district: geo.district || 'Telangana',
        state: 'Telangana',
        commodity: row.commodity,
        variety: row.variety || 'Common',
        modalPrice: parseFloat(row.modal_price || 0) / 100,
        minPrice: parseFloat(row.min_price || 0) / 100,
        maxPrice: parseFloat(row.max_price || 0) / 100,
        date: row.date,
        source: 'CSV Backup'
      });
    }
  }

  return results;
}

export async function getTelanganaCommmodities() {
  if (dbCache.commodities && Date.now() - dbCache.commoditiesAt < CACHE_TTL_MS) {
    return dbCache.commodities;
  }

  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from('telangana_market_prices')
        .select('commodity');

      if (!error && data && data.length > 0) {
        const uniqueSet = new Set();
        data.forEach(r => {
          if (r.commodity && r.commodity.trim()) {
            uniqueSet.add(r.commodity.trim());
          }
        });

        const topCrops = ['Tomato', 'Chilli', 'Cotton', 'Onions', 'Potato', 'Paddy', 'Maize'];
        const list = Array.from(uniqueSet).map(name => ({ code: name, name })).sort((a, b) => {
          const idxA = topCrops.indexOf(a.name);
          const idxB = topCrops.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        dbCache.commodities = list;
        dbCache.commoditiesAt = Date.now();
        return list;
      }
    } catch (e) {
      console.warn('[telanganaData] Supabase commodities fetch failed:', e.message);
    }
  }

  // Fallback to reading from CSV only if DB is unavailable
  ensureParsed();
  const set = new Map();
  for (const row of csvAllRecords) {
    if (row.commodity && !set.has(row.commodity)) {
      set.set(row.commodity, { code: row.commodity, name: row.commodity });
    }
  }
  const topCrops = ['Tomato', 'Chilli', 'Cotton', 'Onions', 'Potato', 'Paddy'];
  return Array.from(set.values()).sort((a, b) => {
    const idxA = topCrops.indexOf(a.name);
    const idxB = topCrops.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns all active Telangana markets from Supabase.
 */
export async function getLiveTelanganaMarkets() {
  if (dbCache.markets && Date.now() - dbCache.marketsAt < CACHE_TTL_MS) {
    return dbCache.markets;
  }

  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from('telangana_market_prices')
        .select('yard_name, yard_code, latitude, longitude');

      if (!error && data && data.length > 0) {
        const uniqueYards = new Map();
        for (const row of data) {
          const code = row.yard_code;
          if (!uniqueYards.has(code)) {
            const geo = YARD_GEO[code] || {};
            uniqueYards.set(code, {
              id: `TS-${code}`,
              name: `${row.yard_name} Market`,
              amcName: row.yard_name,
              district: geo.district || 'Telangana',
              state: 'Telangana',
              latitude: Number(row.latitude) || geo.lat || 17.38,
              longitude: Number(row.longitude) || geo.lng || 78.48,
              yardCode: code,
              source: 'Supabase (telangana_market_prices)'
            });
          }
        }
        const list = Array.from(uniqueYards.values());
        dbCache.markets = list;
        dbCache.marketsAt = Date.now();
        return list;
      }
    } catch (e) {
      console.warn('[telanganaData] Supabase markets fetch failed:', e.message);
    }
  }

  ensureParsed();
  return csvMarkets;
}

/**
 * Returns price history for a commodity at a specific market from Supabase.
 */
export async function getTelanganaMarketHistory({ crop = 'Tomato', yardCode = null } = {}) {
  const cleanCrop = (crop || 'Tomato').trim();
  const cacheKey = `${cleanCrop.toLowerCase()}|${yardCode || 'all'}`;

  const cached = dbCache.historyByCrop.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (supabaseEnabled) {
    try {
      let query = supabase
        .from('telangana_market_prices')
        .select('*')
        .ilike('commodity', `%${cleanCrop}%`);
      if (yardCode) {
        query = query.eq('yard_code', yardCode);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const formatted = data.map(row => ({
          date: row.date,
          price: parseFloat(row.modal_price || 0) / 100, // per Kg
          minPrice: parseFloat(row.min_price || 0) / 100,
          maxPrice: parseFloat(row.max_price || 0) / 100,
          market: row.yard_name,
          arrivals: 0,
          source: 'Supabase (telangana_market_prices)'
        })).sort((a, b) => a.date.localeCompare(b.date));

        dbCache.historyByCrop.set(cacheKey, { data: formatted, timestamp: Date.now() });
        return formatted;
      }
    } catch (e) {
      console.warn('[telanganaData] Supabase market history fetch failed:', e.message);
    }
  }

  ensureParsed();
  const results = [];
  for (const row of csvAllRecords) {
    if (!row.commodity) continue;
    if (row.commodity.toLowerCase() !== cleanCrop.toLowerCase()) continue;
    if (yardCode && row.yard_code !== yardCode) continue;
    results.push({
      date: row.date,
      price: parseFloat(row.modal_price) / 100,
      minPrice: parseFloat(row.min_price) / 100,
      maxPrice: parseFloat(row.max_price) / 100,
      market: row.yard_name,
      arrivals: 0,
      source: 'CSV Backup'
    });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}
