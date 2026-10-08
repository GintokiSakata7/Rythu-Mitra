import { ArrowUpRight, Factory, MapPin, Timer, Truck, TrendingUp, AlertTriangle } from 'lucide-react';

const money = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

export default function OpportunityCard({ opportunity, highlight = false }) {
  if (!opportunity) return null;
  const isLoss = (opportunity.netRealization ?? 0) < 0;

  return (
    <article className={`opportunity-card ${highlight ? 'highlight' : ''} ${isLoss ? 'is-loss' : ''}`}>
      <div className="opp-head">
        <div>
          <div className="opp-tag">{opportunity.type === 'Direct Buyer' ? <><Factory size={14}/> DIRECT BUYER</> : <><TrendingUp size={14}/> MARKET</>}</div>
          <h3>{opportunity.name}</h3>
          <p>{opportunity.district || opportunity.city} · {Number(opportunity.distanceKm).toFixed(1)} km</p>
        </div>
        {highlight && (
          <div className={`recommended-pill ${isLoss ? 'warning' : ''}`}>
            {isLoss ? <><AlertTriangle size={12}/> Lowest loss option</> : <><SparkleDot/> Best option</>}
          </div>
        )}
      </div>
      <div className={`opp-net ${isLoss ? 'opp-net-loss' : ''}`}>
        <span>{isLoss ? '⚠️ Expected net loss' : 'Expected net realization'}</span>
        <strong className={isLoss ? 'text-loss' : ''}>{money(opportunity.netRealization)}</strong>
        <small className={isLoss ? 'text-loss-muted' : ''}>
          {isLoss
            ? `⚠️ ₹${Number(opportunity.expectedNetPerKg || 0).toFixed(2)}/kg net loss`
            : `≈ ₹${Number(opportunity.expectedNetPerKg || 0).toFixed(2)}/kg after costs`}
        </small>
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
