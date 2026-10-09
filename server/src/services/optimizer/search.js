import { env } from '../../lib/env.js';
import { getNearbyMarkets, getBuyerRequirements, refreshMarketPrices } from '../data/marketRepository.js';
import { calculateBreakEvenPrice, calculateMarketEconomics, detectCropPerishability, getMaxSafeDistanceKm } from './costs.js';
import { haversineKm } from './geo.js';
import { rankMarkets } from './ranking.js';

const LEVELS = [
  { level: 1, radiusKm: env.level1RadiusKm, count: env.level1Count },
  { level: 2, radiusKm: env.level2RadiusKm, count: env.level2Count },
  { level: 3, radiusKm: env.level3RadiusKm, count: env.level3Count }
];

function formatNetPerKg(val) {
  const rounded = Number(val.toFixed(1));
  if (rounded < 0) {
    return `−₹${Math.abs(rounded)}`;
  }
  return `₹${rounded}`;
}

function evaluateMarket(market, input) {
  const econ = calculateMarketEconomics({
    quantityKg: input.quantityKg,
    pricePerKg: market.modalPrice,
    distanceKm: market.distanceKm,
    hasTransport: input.hasTransport,
    perishability: input.perishability,
    crop: input.crop
  });
  const qty = Math.max(input.quantityKg, 1);
  return {
    ...market,
    type: 'Market',
    pricePerKg: market.modalPrice,
    ...econ,
    expectedNetPerKg: Number((econ.netRealization / qty).toFixed(2)),
    expectedNetPerKgMin: Number((econ.netRealizationMin / qty).toFixed(2)),
    expectedNetPerKgMax: Number((econ.netRealizationMax / qty).toFixed(2)),
    expectedNetPerKgRange: `${formatNetPerKg(econ.netRealizationMin / qty)} – ${formatNetPerKg(econ.netRealizationMax / qty)}`,
    trendPct: Number((market.trend * 100).toFixed(1)),
    stabilityPct: Math.round(market.stability * 100)
  };
}

function evaluateBuyer(buyer, input) {
  const distanceKm = haversineKm(input.latitude, input.longitude, buyer.latitude, buyer.longitude);
  const targetQty = Math.max(Math.min(input.quantityKg, buyer.quantityKg), 1);

  // Real-world farmgate pickup qualification:
  // Direct buyers offer free pickup ONLY within their local cluster (<= 50 km)
  // OR for large bulk truckloads (>= 5,000 kg). Otherwise farmer bears freight & road risk.
  const isEligibleForPickup = buyer.pickupProvided === true && (distanceKm <= 50 || targetQty >= 5000);

  const econ = calculateMarketEconomics({
    quantityKg: targetQty,
    pricePerKg: buyer.offerPrice,
    distanceKm,
    hasTransport: isEligibleForPickup ? false : input.hasTransport,
    isBuyerPickup: isEligibleForPickup,
    perishability: input.perishability,
    crop: input.crop
  });
  return {
    ...buyer,
    name: buyer.companyName || buyer.name,
    distanceKm,
    type: 'Direct Buyer',
    pricePerKg: buyer.offerPrice,
    ...econ,
    expectedNetPerKg: Number((econ.netRealization / targetQty).toFixed(2)),
    expectedNetPerKgMin: Number((econ.netRealizationMin / targetQty).toFixed(2)),
    expectedNetPerKgMax: Number((econ.netRealizationMax / targetQty).toFixed(2)),
    expectedNetPerKgRange: `${formatNetPerKg(econ.netRealizationMin / targetQty)} – ${formatNetPerKg(econ.netRealizationMax / targetQty)}`,
    pickupProvided: isEligibleForPickup,
    originalPickupOffered: buyer.pickupProvided === true
  };
}

export async function optimizeSellingOpportunity(input) {
  input.perishability = input.perishability || detectCropPerishability(input.crop);
  const trace = [];
  const allEvaluated = new Map();
  let requestCount = 0;
  let stopReason = 'Maximum search radius reached';
  let expandedTo = 1;

  const buyers = (input.includeBuyers ?? true) ? await getBuyerRequirements({ crop: input.crop }) : [];
  const buyerEvaluated = buyers
    .filter((b) => b.quantityKg >= Math.min(input.quantityKg * 0.4, input.quantityKg))
    .map((b) => evaluateBuyer(b, input));

  for (const level of LEVELS) {
    expandedTo = level.level;
    const candidatesRaw = await getNearbyMarkets({
      latitude: input.latitude,
      longitude: input.longitude,
      crop: input.crop,
      radiusKm: level.radiusKm,
      count: level.count
    });

    const liveRefresh = await refreshMarketPrices({ markets: candidatesRaw, crop: input.crop });
    const candidates = liveRefresh.markets;
    requestCount += 1 + liveRefresh.externalCalls;
    for (const candidate of candidates) {
      const evaluated = evaluateMarket(candidate, input);
      allEvaluated.set(candidate.id, evaluated);
    }

    const ranked = rankMarkets([...allEvaluated.values(), ...buyerEvaluated]);
    const best = ranked[0];
    const second = ranked[1];
    const gap = second ? (best.netRealization - second.netRealization) / Math.max(Math.abs(best.netRealization), 1) : 0;

    trace.push({
      level: level.level,
      radiusKm: level.radiusKm,
      candidatesReturned: candidates.length,
      liveDataUsed: candidates.some((x) => String(x.source).includes('commodityonline')),
      liveDataError: liveRefresh.liveError,
      evaluatedCount: allEvaluated.size + buyerEvaluated.length,
      bestOpportunity: best?.name,
      bestNet: best?.netRealization,
      gapPct: Number((gap * 100).toFixed(1))
    });

    if (!best) continue;

    const farthestKnown = Math.max(...[...allEvaluated.values()].map((x) => x.distanceKm), 0);
    const currentBestBreakEven = calculateBreakEvenPrice({
      quantityKg: input.quantityKg,
      currentBestNet: best.netRealization,
      distanceKm: Math.min(farthestKnown + 50, env.level3RadiusKm),
      hasTransport: input.hasTransport,
      perishability: input.perishability
    });

    const maxKnownPrice = Math.max(...[...allEvaluated.values()].map((x) => x.pricePerKg), best.pricePerKg);
    const clearWinner = gap >= env.searchClearGap;
    const isProfitable = best.netRealization > 0;
    const hasEnoughCandidates = allEvaluated.size >= 3;

    const maxSafeDist = getMaxSafeDistanceKm(input.perishability);
    if (level.radiusKm > maxSafeDist && allEvaluated.size >= 1) {
      stopReason = `Search radius capped at ${maxSafeDist} km to prevent crop spoilage for ${input.crop}.`;
      break;
    }

    if (level.level === 1 && clearWinner && isProfitable && hasEnoughCandidates && maxKnownPrice < currentBestBreakEven) {
      stopReason = 'Level 1 winner already has a clear economic lead; farther markets would need an unusually high break-even price.';
      break;
    }
    if (level.level === 2 && clearWinner && isProfitable && hasEnoughCandidates && maxKnownPrice < currentBestBreakEven) {
      stopReason = 'Expanded search did not reveal a price capable of justifying further travel.';
      break;
    }
    if (level.level === 3) {
      stopReason = 'Maximum configured search radius reached.';
    }
  }

  const ranked = rankMarkets([...allEvaluated.values(), ...buyerEvaluated]);
  const top = ranked[0];
  const runnerUp = ranked[1];
  const opportunityGain = runnerUp ? top.netRealization - runnerUp.netRealization : 0;

  return {
    input,
    recommendation: top,
    alternatives: ranked.filter((x) => (x.id || x.name) !== (top?.id || top?.name)).slice(0, 8),
    search: {
      apiLikeCalls: requestCount,
      candidatesEvaluated: allEvaluated.size + buyerEvaluated.length,
      levelsUsed: expandedTo,
      stopReason,
      trace,
      skippedByDesign: Math.max(0, 100 - allEvaluated.size - buyerEvaluated.length)
    },
    opportunityGain
  };
}
