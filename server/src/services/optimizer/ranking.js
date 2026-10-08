export function marketScore({ netRealization, stability, distanceKm, trend, maxNet, minNet }) {
  const netRange = Math.max(maxNet - minNet, 1);
  const netScore = (netRealization - minNet) / netRange;
  const distanceScore = 1 - Math.min(distanceKm / 180, 1);
  const trendScore = Math.max(0, Math.min((trend + 0.1) / 0.2, 1));
  return Number((0.65 * netScore + 0.15 * stability + 0.1 * distanceScore + 0.1 * trendScore).toFixed(4));
}

export function rankMarkets(evaluated) {
  const nets = evaluated.map((x) => x.netRealization);
  const maxNet = Math.max(...nets);
  const minNet = Math.min(...nets);
  return [...evaluated]
    .map((x) => ({ ...x, score: marketScore({ ...x, maxNet, minNet }) }))
    .sort((a, b) => b.score - a.score || b.netRealization - a.netRealization);
}
