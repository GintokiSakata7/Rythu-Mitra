const fs = require('fs');
const lines = fs.readFileSync('server/src/data/market_prices.csv', 'utf8').trim().split('\n');
const YARD_GEO = {
  '1327': { lat: 16.55, lng: 78.07, district: 'Nagarkurnool' },
  '11':   { lat: 19.10, lng: 77.96, district: 'Nirmal' },
  '12':   { lat: 19.44, lng: 78.45, district: 'Adilabad' },
  '3':    { lat: 17.48, lng: 78.46, district: 'Hyderabad' },
  '1123': { lat: 18.54, lng: 79.17, district: 'Karimnagar' },
  '1352': { lat: 16.12, lng: 77.58, district: 'Mahbubnagar' },
  '1215': { lat: 17.87, lng: 78.12, district: 'Siddipet' },
  '1':    { lat: 17.35, lng: 78.54, district: 'Rangareddy' },
  '2':    { lat: 17.35, lng: 78.55, district: 'Rangareddy' },
  '1328': { lat: 16.23, lng: 77.80, district: 'Jogulamba Gadwal' },
  '1571': { lat: 17.39, lng: 78.45, district: 'Hyderabad' },
  '5':    { lat: 17.38, lng: 78.47, district: 'Hyderabad' },
  '6':    { lat: 17.37, lng: 78.48, district: 'Hyderabad' },
  '7':    { lat: 17.40, lng: 78.44, district: 'Hyderabad' },
  '1125': { lat: 18.79, lng: 78.91, district: 'Jagtial' },
  '26':   { lat: 19.07, lng: 78.27, district: 'Adilabad' },
  '36':   { lat: 18.30, lng: 79.21, district: 'Karimnagar' },
  '1208': { lat: 17.72, lng: 77.83, district: 'Sangareddy' },
  '1340': { lat: 16.58, lng: 78.39, district: 'Nagarkurnool' },
  '1168': { lat: 17.80, lng: 79.93, district: 'Warangal' },
  '1067': { lat: 17.25, lng: 80.15, district: 'Khammam' },
  '1177': { lat: 17.60, lng: 80.00, district: 'Mahabubabad' },
  '1326': { lat: 16.74, lng: 77.98, district: 'Mahbubnagar' },
  '1334': { lat: 16.48, lng: 78.32, district: 'Nagarkurnool' },
  '1342': { lat: 16.73, lng: 77.50, district: 'Narayanpet' },
  '1080': { lat: 18.67, lng: 78.10, district: 'Nizamabad' },
  '1330': { lat: 17.06, lng: 78.20, district: 'Rangareddy' },
  '1091': { lat: 17.14, lng: 79.62, district: 'Suryapet' },
  '37':   { lat: 17.25, lng: 77.58, district: 'Vikarabad' },
  '9':    { lat: 17.05, lng: 79.49, district: 'Nalgonda' },
  '1612': { lat: 17.54, lng: 78.37, district: 'Medchal' },
  '1106': { lat: 17.05, lng: 79.27, district: 'Nalgonda' },
  '1344': { lat: 16.36, lng: 78.06, district: 'Wanaparthy' },
  '886':  { lat: 18.00, lng: 79.59, district: 'Hanamkonda' },
  '1198': { lat: 17.68, lng: 77.60, district: 'Sangareddy' }
};

const header = lines[0].split(',');
const idx = {
  DDate: header.indexOf('DDate'),
  YardCode: header.indexOf('YardCode'),
  YardName: header.indexOf('YardName'),
  CommName: header.indexOf('CommName'),
  VarityName: header.indexOf('VarityName'),
  Minimum: header.indexOf('Minimum'),
  Maximum: header.indexOf('Maximum'),
  Model: header.indexOf('Model')
};

let out = 'date,yard_code,yard_name,commodity,variety,min_price,max_price,modal_price,latitude,longitude\n';

for(let i=1; i<lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length < header.length) continue;
  
  const ycode = parts[idx.YardCode].replace(/^\"|\"$/g, '');
  const geo = YARD_GEO[ycode] || { lat: 17.38, lng: 78.48 };
  
  const minP = parseFloat(parts[idx.Minimum]);
  const maxP = parseFloat(parts[idx.Maximum]);
  const modP = parseFloat(parts[idx.Model]);
  
  out += `${parts[idx.DDate]},${ycode},${parts[idx.YardName]},${parts[idx.CommName]},${parts[idx.VarityName]},${minP},${maxP},${modP},${geo.lat},${geo.lng}\n`;
}
fs.writeFileSync('server/src/data/optimized_market_prices.csv', out);
console.log('Created optimized_market_prices.csv with ' + (lines.length-1) + ' rows.');
