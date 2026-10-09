export function marketScore({ netRealization, stability = 0.7, distanceKm = 0, trend = 0, maxNet, minNet, feasibility, maxSafeDistanceKm }) {
  const netRange = Math.max(maxNet - minNet, 1);
  const netScore = (netRealization - minNet) / netRange;
  const distanceScore = 1 - Math.min(distanceKm / 180, 1);
  const trendScore = Math.max(0, Math.min((trend + 0.1) / 0.2, 1));
  let baseScore = (0.65 * netScore + 0.15 * stability + 0.1 * distanceScore + 0.1 * trendScore);

  // Realism penalty: If transit distance is hazardous for perishable crops, penalize recommendation score
  if (feasibility === 'excessive_distance' || (maxSafeDistanceKm && distanceKm > maxSafeDistanceKm * 1.5)) {
    baseScore *= 0.25; // Heavily demote unviable long-distance transit
  } else if (feasibility === 'transit_risk' || (maxSafeDistanceKm && distanceKm > maxSafeDistanceKm)) {
    baseScore *= 0.70;
  }

  return Number(baseScore.toFixed(4));
}

export function rankMarkets(evaluated) {
  const nets = evaluated.map((x) => x.netRealization);
  const maxNet = Math.max(...nets);
  const minNet = Math.min(...nets);
  return [...evaluated]
    .map((x) => ({ ...x, score: marketScore({ ...x, maxNet, minNet }) }))
    .sort((a, b) => b.score - a.score || b.netRealization - a.netRealization);
}
