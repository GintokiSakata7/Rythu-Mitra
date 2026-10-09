import { env } from '../../lib/env.js';

export const VEHICLE_TIERS = [
  {
    id: 'auto_trolley',
    name: 'Auto Trolley (3-Wheeler)',
    nameTe: 'ఆటో ట్రాలీ',
    nameHi: 'ऑटो ट्रॉली',
    maxCapacityKg: 800, // up to 8 quintals
    baseHireMin: 350,
    baseHireMax: 500,
    ratePerKmMin: 18,
    ratePerKmMax: 24,
    fuelOnlyRatePerKm: 9,
    avgSpeedKmph: 35
  },
  {
    id: 'tata_ace',
    name: 'Tata Ace / Bolero Pickup',
    nameTe: 'టాటా ఏస్ / బొలేరో పికప్',
    nameHi: 'छोटा हाथी / बोलेरो पिकअप',
    maxCapacityKg: 2200, // 8 to 22 quintals
    baseHireMin: 700,
    baseHireMax: 1000,
    ratePerKmMin: 28,
    ratePerKmMax: 38,
    fuelOnlyRatePerKm: 14,
    avgSpeedKmph: 42
  },
  {
    id: 'tractor_trolley',
    name: 'Tractor Trolley',
    nameTe: 'ట్రాక్టర్ ట్రాలీ',
    nameHi: 'ट्रैक्टर ट्रॉली',
    maxCapacityKg: 5500, // 22 to 55 quintals (2.2 - 5.5 tons)
    baseHireMin: 1400,
    baseHireMax: 2000,
    ratePerKmMin: 45,
    ratePerKmMax: 65,
    fuelOnlyRatePerKm: 22,
    avgSpeedKmph: 28
  },
  {
    id: 'canter_truck',
    name: '6-Wheeler Mini Truck / Canter',
    nameTe: 'మినీ లారీ / క్యాంటర్ (6-వీలర్)',
    nameHi: 'कैंटर / 6-पहिया मिनी ट्रक',
    maxCapacityKg: 11000, // 55 to 110 quintals (5.5 - 11 tons)
    baseHireMin: 2500,
    baseHireMax: 3500,
    ratePerKmMin: 65,
    ratePerKmMax: 90,
    fuelOnlyRatePerKm: 32,
    avgSpeedKmph: 38
  },
  {
    id: 'heavy_truck',
    name: '10-Wheeler Commercial Truck',
    nameTe: 'భారీ లారీ (10-వీలర్)',
    nameHi: '10-पहिया बड़ा ट्रक',
    maxCapacityKg: 25000, // > 110 quintals
    baseHireMin: 4500,
    baseHireMax: 6500,
    ratePerKmMin: 85,
    ratePerKmMax: 120,
    fuelOnlyRatePerKm: 45,
    avgSpeedKmph: 40
  }
];

export function selectVehicleTier(quantityKg) {
  const qty = Math.max(Number(quantityKg) || 1, 1);
  for (const tier of VEHICLE_TIERS) {
    if (qty <= tier.maxCapacityKg) {
      return tier;
    }
  }
  return VEHICLE_TIERS[VEHICLE_TIERS.length - 1];
}

export function calculateMarketEconomics({
  quantityKg,
  pricePerKg,
  distanceKm,
  hasTransport = false,
  isBuyerPickup = false,
  perishability = 'high',
  avgSpeedKmph = null
}) {
  const qty = Math.max(Number(quantityKg) || 1, 1);
  const dist = Math.max(Number(distanceKm) || 0, 0);
  const roundTripKm = dist * 2;
  const vehicle = selectVehicleTier(qty);
  const effectiveSpeed = avgSpeedKmph || vehicle.avgSpeedKmph;
  const travelHours = Number((dist / effectiveSpeed).toFixed(1));

  let transportCostMin = 0;
  let transportCostMax = 0;
  let transportCost = 0;
  let transportRange = '';
  let vehicleName = vehicle.name;
  let vehicleNameTe = vehicle.nameTe;
  let vehicleNameHi = vehicle.nameHi;

  if (isBuyerPickup) {
    vehicleName = 'Buyer Farmgate Pickup (Free)';
    vehicleNameTe = 'కొనుగోలుదారు ఉచిత పికప్ (తోట వద్దనే)';
    vehicleNameHi = 'खरीदार द्वारा निःशुल्क पिकअप';
    transportCostMin = 0;
    transportCostMax = 0;
    transportCost = 0;
    transportRange = '₹0 (Free Farm Pickup)';
  } else if (hasTransport) {
    // Farmer uses own vehicle: fuel + maintenance
    transportCostMin = Math.round(roundTripKm * vehicle.fuelOnlyRatePerKm * 0.9 + (vehicle.baseHireMin * 0.2));
    transportCostMax = Math.round(roundTripKm * vehicle.fuelOnlyRatePerKm * 1.15 + (vehicle.baseHireMin * 0.35));
    transportCost = Math.round((transportCostMin + transportCostMax) / 2);
    transportRange = `₹${transportCostMin.toLocaleString('en-IN')} – ₹${transportCostMax.toLocaleString('en-IN')}`;
    vehicleName = `Own ${vehicle.name}`;
    vehicleNameTe = `సొంత ${vehicle.nameTe}`;
    vehicleNameHi = `स्वयं का ${vehicle.nameHi}`;
  } else {
    // Commercial vehicle hire: base booking fee + round-trip distance rate
    transportCostMin = Math.round(vehicle.baseHireMin + (roundTripKm * vehicle.ratePerKmMin));
    transportCostMax = Math.round(vehicle.baseHireMax + (roundTripKm * vehicle.ratePerKmMax));
    transportCost = Math.round((transportCostMin + transportCostMax) / 2);
    transportRange = `₹${transportCostMin.toLocaleString('en-IN')} – ₹${transportCostMax.toLocaleString('en-IN')}`;
  }

  const timeCost = Math.round(travelHours * env.timeValuePerHour * (hasTransport ? 0.8 : 1));
  const spoilageMultiplier = perishability === 'high' ? 1 : perishability === 'medium' ? 0.45 : 0.15;
  const riskCost = Math.round(dist * env.riskRatePerKm * spoilageMultiplier * Math.sqrt(qty));
  const saleValue = Math.round(qty * pricePerKg);

  const netRealization = saleValue - transportCost - timeCost - riskCost;
  const netRealizationMin = saleValue - transportCostMax - timeCost - riskCost;
  const netRealizationMax = saleValue - transportCostMin - timeCost - riskCost;
  const fmtInr = (val) => {
    const rounded = Math.round(val);
    if (rounded < 0) {
      return `−₹${Math.abs(rounded).toLocaleString('en-IN')}`;
    }
    return `₹${rounded.toLocaleString('en-IN')}`;
  };
  const netRange = `${fmtInr(netRealizationMin)} – ${fmtInr(netRealizationMax)}`;

  return {
    saleValue,
    transportCost,
    transportCostMin,
    transportCostMax,
    transportRange,
    vehicleId: vehicle.id,
    vehicleName,
    vehicleNameTe,
    vehicleNameHi,
    timeCost,
    riskCost,
    travelHours,
    netRealization,
    netRealizationMin,
    netRealizationMax,
    netRange,
    transportRate: vehicle.ratePerKmMin
  };
}

export function calculateBreakEvenPrice({ quantityKg, currentBestNet, distanceKm, hasTransport, isBuyerPickup = false, perishability = 'high' }) {
  const extras = calculateMarketEconomics({
    quantityKg,
    pricePerKg: 0,
    distanceKm,
    hasTransport,
    isBuyerPickup,
    perishability
  });
  return (currentBestNet + extras.transportCost + extras.timeCost + extras.riskCost) / Math.max(quantityKg, 1);
}
