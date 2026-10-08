import { MapPinned } from 'lucide-react';

export default function MarketMap({ opportunities = [], farmer }) {
  const points = opportunities.slice(0, 8);
  const latitudes = points.map((p) => Number(p.latitude)).concat([farmer?.latitude || 17.05]);
  const longitudes = points.map((p) => Number(p.longitude)).concat([farmer?.longitude || 79.27]);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes), maxLng = Math.max(...longitudes);
  const normalize = (value, min, max) => max === min ? 50 : ((value - min) / (max - min)) * 76 + 12;
  return (
    <div className="map-card">
      <div className="map-head"><div><div className="eyebrow">OPPORTUNITY MAP</div><h3>Search footprint</h3></div><span><MapPinned size={15}/> proximity-aware</span></div>
      <div className="map-surface">
        <div className="map-grid-lines" />
        <div className="farm-pin" style={{ left: '50%', top: '50%' }}><div className="farm-ring"/><strong>FARM</strong></div>
        {points.map((p, i) => {
          const left = normalize(Number(p.longitude), minLng, maxLng);
          const top = 100 - normalize(Number(p.latitude), minLat, maxLat);
          const isBest = i === 0;
          return <div key={p.id || p.name} className={`map-pin ${isBest ? 'best' : ''}`} style={{ left: `${left}%`, top: `${top}%` }} title={p.name}><span>{isBest ? '★' : i + 1}</span></div>;
        })}
      </div>
      <div className="map-legend"><span><i className="legend-farm"/> Farmer</span><span><i className="legend-best"/> Best</span><span><i className="legend-market"/> Candidate</span></div>
    </div>
  );
}
