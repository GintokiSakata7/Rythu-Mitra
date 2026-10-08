import { env } from '../../lib/env.js';

export function calculateMarketEconomics({ quantityKg, pricePerKg, distanceKm, hasTransport = false, perishability = 'high', avgSpeedKmph = 42 }) {
  const transportRate = hasTransport ? env.transportRatePerKm * 0.35 : env.transportRatePerKm;
  const roundTripKm = distanceKm * 2;
  const transportCost = Math.round(roundTripKm * transportRate);
  const travelHours = Number((distanceKm / avgSpeedKmph).toFixed(1));
  const timeCost = Math.round(travelHours * env.timeValuePerHour * (hasTransport ? 0.8 : 1));
  const spoilageMultiplier = perishability === 'high' ? 1 : perishability === 'medium' ? 0.45 : 0.15;
  const riskCost = Math.round(distanceKm * env.riskRatePerKm * spoilageMultiplier * Math.sqrt(Math.max(quantityKg, 1)));
  const saleValue = Math.round(quantityKg * pricePerKg);
  const netRealization = saleValue - transportCost - timeCost - riskCost;

  return {
    saleValue,
    transportCost,
    timeCost,
    riskCost,
    travelHours,
    netRealization,
    transportRate
  };
}

export function calculateBreakEvenPrice({ quantityKg, currentBestNet, distanceKm, hasTransport, perishability = 'high' }) {
  const extras = calculateMarketEconomics({
    quantityKg,
    pricePerKg: 0,
    distanceKm,
    hasTransport,
    perishability
  });
  return (currentBestNet + extras.transportCost + extras.timeCost + extras.riskCost) / Math.max(quantityKg, 1);
}
