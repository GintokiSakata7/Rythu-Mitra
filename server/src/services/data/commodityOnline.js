import * as cheerio from 'cheerio';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function parsePriceString(priceStr) {
  // Expected format: "Rs 27.5/Kg (Rs 25-Rs 30)" or "Rs 10/Kg (Rs 10-Rs 10)"
  const modalMatch = priceStr.match(/Rs\s*([\d.]+)\s*\/\s*Kg/i);
  const rangeMatch = priceStr.match(/\(\s*Rs\s*([\d.]+)\s*-\s*Rs\s*([\d.]+)\s*\)/i);
  
  return {
    modalPrice: modalMatch ? parseFloat(modalMatch[1]) : null,
    minPrice: rangeMatch ? parseFloat(rangeMatch[1]) : null,
    maxPrice: rangeMatch ? parseFloat(rangeMatch[2]) : null,
  };
}

function fetchWithPython(url) {
  const script = `
import urllib.request, sys
req = urllib.request.Request('${url}', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'})
try:
    with urllib.request.urlopen(req) as res:
        sys.stdout.buffer.write(res.read())
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;
  const tmpFile = join(tmpdir(), 'fetch_' + Date.now() + '.py');
  try {
    writeFileSync(tmpFile, script);
    const output = execSync(`python "${tmpFile}"`, { maxBuffer: 1024 * 1024 * 10 });
    unlinkSync(tmpFile);
    return output.toString('utf-8');
  } catch (error) {
    try { unlinkSync(tmpFile); } catch (e) {}
    throw new Error('Python fetch failed: ' + (error.stderr ? error.stderr.toString() : error.message));
  }
}



export async function fetchCommodityOnlineData({ crop = 'Tomato' } = {}) {
  const cropLower = crop.toLowerCase();
  const url = `https://www.commodityonline.com/mandiprices/${cropLower}/telangana/`;
  
  try {
    const html = fetchWithPython(url);

    const $ = cheerio.load(html);
    const records = [];

    // Parse the table
    $('table tr').each((i, el) => {
      if (i === 0) return; // skip header
      const tds = $(el).find('td');
      if (tds.length > 3) {
        const market = $(tds[0]).text().trim();
        const variety = $(tds[1]).text().trim();
        const priceStr = $(tds[2]).text().trim().replace(/\u20b9/g, 'Rs ');
        const date = $(tds[3]).text().trim();
        
        const prices = parsePriceString(priceStr);
        if (prices.modalPrice !== null) {
          records.push({
            market: market,
            district: '', // CommodityOnline doesn't split district easily here, but we match by market name
            state: 'Telangana',
            commodity: crop,
            variety: variety,
            modalPrice: prices.modalPrice,
            minPrice: prices.minPrice,
            maxPrice: prices.maxPrice,
            date: date
          });
        }
      }
    });

    return { enabled: true, records, requestCount: 1 };
  } catch (error) {
    return { enabled: true, records: [], requestCount: 1, error: error.message };
  }
}
