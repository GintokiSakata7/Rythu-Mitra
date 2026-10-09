import 'dotenv/config';

const num = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const env = {
  port: num('PORT', 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'mandi-mitra-super-secure-session-key-2026',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  dataGovApiKey: process.env.DATA_GOV_API_KEY || '',
  dataGovResourceId: process.env.DATA_GOV_RESOURCE_ID || '',
  dataGovApiBase: process.env.DATA_GOV_API_BASE || 'https://api.data.gov.in/resource',
  dataGovCommodityParam: process.env.DATA_GOV_COMMODITY_PARAM || 'filters[commodity]',
  transportRatePerKm: num('TRANSPORT_RATE_PER_KM', 18),
  timeValuePerHour: num('TIME_VALUE_PER_HOUR', 300),
  riskRatePerKm: num('RISK_RATE_PER_KM', 0.35),
  searchClearGap: num('SEARCH_CLEAR_GAP', 0.035),
  level1Count: num('LEVEL_1_COUNT', 15),
  level2Count: num('LEVEL_2_COUNT', 25),
  level3Count: num('LEVEL_3_COUNT', 35),
  level1RadiusKm: num('LEVEL_1_RADIUS_KM', 45),
  level2RadiusKm: num('LEVEL_2_RADIUS_KM', 90),
  level3RadiusKm: num('LEVEL_3_RADIUS_KM', 180)
};
