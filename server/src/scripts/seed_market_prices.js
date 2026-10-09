import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function parseDate(dateStr) {
  // e.g. "08-06-26" -> MM-DD-YY -> 2026-08-06
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

async function run() {
  const client = await pool.connect();
  try {
    console.log('[Seed] Creating table public.market_prices...');

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS public.market_prices (
          id BIGSERIAL PRIMARY KEY,
          price_date DATE NOT NULL,
          amc_code INTEGER,
          amc_name VARCHAR(150),
          yard_code INTEGER,
          yard_name VARCHAR(150),
          commodity_code INTEGER,
          commodity_name VARCHAR(150) NOT NULL,
          variety_code INTEGER,
          variety_name VARCHAR(150),
          prog_arrivals NUMERIC(12, 2) DEFAULT 0.0,
          arrivals NUMERIC(12, 2) DEFAULT 0.0,
          min_price NUMERIC(12, 2),        -- Rs/Quintal
          max_price NUMERIC(12, 2),        -- Rs/Quintal
          modal_price NUMERIC(12, 2),      -- Rs/Quintal
          valuation NUMERIC(14, 2) DEFAULT 0.0,
          market_fee NUMERIC(12, 2) DEFAULT 0.0,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON public.market_prices (commodity_name);
      CREATE INDEX IF NOT EXISTS idx_market_prices_yard ON public.market_prices (yard_name);
      CREATE INDEX IF NOT EXISTS idx_market_prices_date ON public.market_prices (price_date DESC);
      CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date ON public.market_prices (commodity_name, price_date DESC);

      ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access on market_prices" ON public.market_prices;
      CREATE POLICY "Allow public read access on market_prices" ON public.market_prices FOR SELECT USING (true);
    `;

    await client.query(createTableSql);
    console.log('[Seed] Table public.market_prices created successfully.');

    // Check existing count
    const countRes = await client.query('SELECT COUNT(*) FROM public.market_prices');
    console.log('[Seed] Existing rows in market_prices:', countRes.rows[0].count);

    // Read CSV
    const csvPath = join(__dirname, '..', 'data', 'market_prices.csv');
    console.log('[Seed] Reading CSV from:', csvPath);
    const raw = readFileSync(csvPath, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());

    console.log(`[Seed] Found ${lines.length - 1} records in CSV. Inserting...`);

    // Clean existing rows before re-populating to ensure fresh data
    await client.query('TRUNCATE TABLE public.market_prices RESTART IDENTITY');

    let inserted = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 14) continue;

      const pDate = parseDate(cols[0]);
      const amcCode = parseInt(cols[1]) || null;
      const amcName = cols[2] || null;
      const yardCode = parseInt(cols[3]) || null;
      const yardName = cols[4] || null;
      const commCode = parseInt(cols[5]) || null;
      const commName = cols[6] || null;
      const varCode = parseInt(cols[7]) || null;
      const varName = cols[8] || null;
      const progArrivals = parseFloat(cols[9]) || 0;
      const arrivals = parseFloat(cols[10]) || 0;
      const minPrice = parseFloat(cols[11]) || null;
      const maxPrice = parseFloat(cols[12]) || null;
      const modalPrice = parseFloat(cols[13]) || null;
      const valuation = parseFloat(cols[14]) || 0;
      const marketFee = parseFloat(cols[15]) || 0;

      await client.query(
        `INSERT INTO public.market_prices (
          price_date, amc_code, amc_name, yard_code, yard_name,
          commodity_code, commodity_name, variety_code, variety_name,
          prog_arrivals, arrivals, min_price, max_price, modal_price,
          valuation, market_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          pDate, amcCode, amcName, yardCode, yardName,
          commCode, commName, varCode, varName,
          progArrivals, arrivals, minPrice, maxPrice, modalPrice,
          valuation, marketFee
        ]
      );
      inserted++;
    }

    console.log(`[Seed] Successfully inserted ${inserted} rows into public.market_prices table!`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
