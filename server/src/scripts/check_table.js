import 'dotenv/config';
import pg from 'pg';

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  await client.query(`
    ALTER TABLE public."day_prices_between_01_08_2026_31_08_2026" ENABLE ROW LEVEL SECURITY;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'day_prices_between_01_08_2026_31_08_2026' 
          AND policyname = 'Allow public read access on day_prices'
      ) THEN
        CREATE POLICY "Allow public read access on day_prices" 
        ON public."day_prices_between_01_08_2026_31_08_2026" 
        FOR SELECT 
        USING (true);
      END IF;
    END
    $$;
  `);
  
  console.log('Successfully enabled RLS and public SELECT policy on day_prices_between_01_08_2026_31_08_2026');
  await client.end();
}

main().catch(console.error);
