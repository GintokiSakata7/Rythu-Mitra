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
    const csvPath = join(__dirname, '..', '..', 'data', 'market_prices.csv');
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
      const key = `${row.YardCode}|${row.CommName}`;
      if (!csvLatestPrices[key] || row.DDate > csvLatestPrices[key].DDate) {
        csvLatestPrices[key] = row;
      }

      // Build unique yards
      if (!yardsMap.has(row.YardCode)) {
        const geo = YARD_GEO[row.YardCode] || { lat: 17.38, lng: 78.48, district: 'Unknown' };
        yardsMap.set(row.YardCode, {
          id: `TS-${row.YardCode}`,
          name: `${row.YardName} Market`,
          amcName: row.AmcName,
          district: geo.district,
          state: 'Telangana',
          latitude: geo.lat,
          longitude: geo.lng,
          yardCode: row.YardCode,
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

/**
 * Returns the latest CSV prices for a given commodity across all markets.
 * Prices are converted from Rs/Quintal to Rs/Kg.
 * @param {string} crop - The commodity name (e.g. "Tomato", "Onions")
 * @returns {Array} - [{market, district, state, commodity, variety, modalPrice, minPrice, maxPrice, date}]
 */
export async function getTelanganaFallbackPrices({ crop = 'Tomato' } = {}) {
  // Try to fetch from the new Supabase table first!
  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from('telangana_market_prices')
        .select('*')
        .ilike('CommName', crop);
        
      if (!error && data && data.length > 0) {
        return data.map(row => {
          const geo = YARD_GEO[row.YardCode] || {};
          return {
            market: row.YardName,
            district: geo.district || row.AmcName,
            state: 'Telangana',
            commodity: row.CommName,
            variety: row.VarityName,
            // CSV prices are per Quintal (100kg) — convert to per Kg
            modalPrice: parseFloat(row.Model) / 100,
            minPrice: parseFloat(row.Minimum) / 100,
            maxPrice: parseFloat(row.Maximum) / 100,
            date: row.DDate,
            source: 'Supabase (telangana_market_prices)'
          };
        });
      }
    } catch (e) {
      console.warn('[telanganaData] Supabase fetch failed:', e.message);
    }
  }

  return [];
}

/**
 * Returns the full list of commodities available in the CSV
 */
export function getTelanganaCommmodities() {
  ensureParsed();
  const set = new Map();
  for (const row of csvAllRecords) {
    if (!set.has(row.CommCode)) {
      set.set(row.CommCode, { code: row.CommCode, name: row.CommName });
    }
  }
  return Array.from(set.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns price history for a commodity at a specific market (by yardCode).
 * Useful for building trend charts.
 */
export function getTelanganaMarketHistory({ crop = 'Tomato', yardCode = null } = {}) {
  ensureParsed();
  const results = [];
  for (const row of csvAllRecords) {
    if (row.CommName.toLowerCase() !== crop.toLowerCase()) continue;
    if (yardCode && row.YardCode !== yardCode) continue;
    results.push({
      date: row.DDate,
      price: parseFloat(row.Model) / 100, // per Kg
      minPrice: parseFloat(row.Minimum) / 100,
      maxPrice: parseFloat(row.Maximum) / 100,
      market: row.YardName,
      arrivals: parseFloat(row.Arrivals) || 0
    });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}
