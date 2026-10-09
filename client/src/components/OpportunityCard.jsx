import { ArrowUpRight, Factory, MapPin, Timer, Truck, TrendingUp, AlertTriangle } from 'lucide-react';

const money = (n) => (n < 0 ? `−₹${Math.abs(Math.round(n || 0)).toLocaleString('en-IN')}` : `₹${Math.round(n || 0).toLocaleString('en-IN')}`);

export default function OpportunityCard({ opportunity, highlight = false }) {
  if (!opportunity) return null;
  const isLoss = (opportunity.netRealization ?? 0) < 0;
  const handleCardClick = () => {
    if (window.confirm(`Are you sure you want to go with ${opportunity.name}?`)) {
      if (opportunity.latitude && opportunity.longitude) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${opportunity.latitude},${opportunity.longitude}`, '_blank');
      } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opportunity.name + ' ' + (opportunity.district || opportunity.city || ''))}`, '_blank');
      }
    }
  };

  return (
    <article 
      className={`opportunity-card ${highlight ? 'highlight' : ''} ${isLoss ? 'is-loss' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="opp-head">
        <div>
          <div className="opp-tag">
            {opportunity.type === 'Direct Buyer' ? (
              <>
                <Factory size={14} /> DIRECT BUYER · <span style={{ color: '#059669', fontWeight: 800 }}>🛡️ GOVT VERIFIED</span>
              </>
            ) : (
              <>
                <TrendingUp size={14} /> APMC MARKET
              </>
            )}
          </div>
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
        <strong className={isLoss ? 'text-loss' : ''}>{opportunity.netRange || money(opportunity.netRealization)}</strong>
        <small className={isLoss ? 'text-loss-muted' : ''}>
          {isLoss
            ? `⚠️ ${opportunity.expectedNetPerKgRange || ('₹' + Number(opportunity.expectedNetPerKg || 0).toFixed(2))}/kg net loss`
            : `≈ ${opportunity.expectedNetPerKgRange || ('₹' + Number(opportunity.expectedNetPerKg || 0).toFixed(2))}/kg after costs`}
        </small>
      </div>
      <div className="opp-grid">
        <Mini icon={<TrendingUp size={15}/>} label="Offer / modal" value={`₹${Number(opportunity.pricePerKg).toFixed(2)}/kg`} />
        <Mini icon={<Truck size={15}/>} label={opportunity.vehicleName ? (opportunity.vehicleName.length > 14 ? 'Logistics' : opportunity.vehicleName) : 'Transport'} value={opportunity.transportRange || money(opportunity.transportCost)} />
        <Mini icon={<Timer size={15}/>} label="Travel time" value={`${opportunity.travelHours} h`} />
        <Mini icon={<MapPin size={15}/>} label="Risk" value={money(opportunity.riskCost)} />
      </div>
      {opportunity.pickupProvided && <div className="pickup-note"><Truck size={15}/> Buyer farmgate pickup included (Free)</div>}
      {!opportunity.pickupProvided && opportunity.vehicleName && <div className="pickup-note" style={{ background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}><Truck size={15}/> Assigned: {opportunity.vehicleName} ({opportunity.transportRange})</div>}
      <div className="opp-footer"><span>Score {Math.round((opportunity.score || 0) * 100)}%</span><ArrowUpRight size={16}/></div>
    </article>
  );
}

function Mini({ icon, label, value }) { return <div className="mini-cell"><span>{icon}{label}</span><strong>{value}</strong></div>; }
function SparkleDot() { return <span className="sparkle-dot">✦</span>; }
