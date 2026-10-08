const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('test.html', 'utf8');
const $ = cheerio.load(html);
const rows = $('table tr');
console.log('Total table rows:', rows.length);
if (rows.length > 0) {
  console.log('Row 1 HTML:', $(rows[1]).html());
}
