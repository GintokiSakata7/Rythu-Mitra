import { ArrowUpRight, Factory, MapPin, Timer, Truck, TrendingUp } from 'lucide-react';

const money = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

export default function OpportunityCard({ opportunity, highlight = false }) {
  if (!opportunity) return null;
  return (
    <article className={`opportunity-card ${highlight ? 'highlight' : ''}`}>
      <div className="opp-head">
        <div>
          <div className="opp-tag">{opportunity.type === 'Direct Buyer' ? <><Factory size={14}/> DIRECT BUYER</> : <><TrendingUp size={14}/> MARKET</>}</div>
          <h3>{opportunity.name}</h3>
          <p>{opportunity.district || opportunity.city} · {Number(opportunity.distanceKm).toFixed(1)} km</p>
        </div>
        {highlight && <div className="recommended-pill"><SparkleDot/> Best option</div>}
      </div>
      <div className="opp-net">
        <span>Expected net realization</span>
        <strong>{money(opportunity.netRealization)}</strong>
        <small>≈ ₹{Number(opportunity.expectedNetPerKg || 0).toFixed(2)}/kg after costs</small>
      </div>
      <div className="opp-grid">
        <Mini icon={<TrendingUp size={15}/>} label="Offer / modal" value={`₹${Number(opportunity.pricePerKg).toFixed(2)}/kg`} />
        <Mini icon={<Truck size={15}/>} label="Transport" value={money(opportunity.transportCost)} />
        <Mini icon={<Timer size={15}/>} label="Travel time" value={`${opportunity.travelHours} h`} />
        <Mini icon={<MapPin size={15}/>} label="Risk" value={money(opportunity.riskCost)} />
      </div>
      {opportunity.pickupProvided && <div className="pickup-note"><Truck size={15}/> Buyer pickup included</div>}
      <div className="opp-footer"><span>Score {Math.round((opportunity.score || 0) * 100)}%</span><ArrowUpRight size={16}/></div>
    </article>
  );
}

function Mini({ icon, label, value }) { return <div className="mini-cell"><span>{icon}{label}</span><strong>{value}</strong></div>; }
function SparkleDot() { return <span className="sparkle-dot">✦</span>; }
