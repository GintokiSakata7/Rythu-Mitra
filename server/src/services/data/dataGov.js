import { env } from '../../lib/env.js';

function number(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalizeRecord(record) {
  const get = (...keys) => {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null && record[key] !== '') return record[key];
    }
    return '';
  };
  return {
    state: get('state', 'State'),
    district: get('district', 'District'),
    market: get('market', 'Market', 'market_name'),
    commodity: get('commodity', 'Commodity'),
    variety: get('variety', 'Variety'),
    minPrice: number(get('min_price', 'min_price_per_quintal', 'Min Price')),
    maxPrice: number(get('max_price', 'max_price_per_quintal', 'Max Price')),
    modalPrice: number(get('modal_price', 'modal_price_per_quintal', 'Modal Price')),
    date: get('arrival_date', 'date', 'Arrival Date')
  };
}

/**
 * Optional live adapter. The exact data.gov.in resource schema can vary by resource,
 * so normalization is intentionally defensive. The optimizer can operate entirely on
 * Supabase/demo cached data when this connector is not configured.
 */
export async function fetchGovernmentMarketData({ crop = 'Tomato', limit = 100 } = {}) {
  if (!env.dataGovApiKey || !env.dataGovResourceId) {
    return { enabled: false, records: [], requestCount: 0 };
  }

  const url = new URL(`${env.dataGovApiBase}/${env.dataGovResourceId}`);
  url.searchParams.set('api-key', env.dataGovApiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', '0');
  if (env.dataGovCommodityParam) url.searchParams.set(env.dataGovCommodityParam, crop);

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return { enabled: true, records: [], requestCount: 1, error: `data.gov.in returned ${response.status}` };
    const payload = await response.json();
    const records = Array.isArray(payload.records) ? payload.records.map(normalizeRecord) : [];
    return { enabled: true, records, requestCount: 1 };
  } catch (error) {
    return { enabled: true, records: [], requestCount: 1, error: error.message };
  }
}
