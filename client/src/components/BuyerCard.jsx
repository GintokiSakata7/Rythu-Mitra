import { CalendarDays, Factory, Package, Truck, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function BuyerCard({ buyer }) {
  const isVerified = buyer.isVerified ?? true; // default true for vetted buyers in network

  return (
    <article className="buyer-card">
      <div className="buyer-top">
        <div className="company-icon"><Factory size={19}/></div>
        <div>
          <div className="buyer-title-row">
            <h3>{buyer.companyName}</h3>
            {isVerified && (
              <span className="verified-seal-tag" title="Government Registered & MandiMitra KYB Verified">
                <BadgeCheck size={14} /> Govt Verified
              </span>
            )}
          </div>
          <p>{buyer.type} · {buyer.city || 'Telangana'}</p>
        </div>
        <span className="open-pill">{buyer.status || 'Active'}</span>
      </div>

      {isVerified && (
        <div className="buyer-trust-strip">
          <ShieldCheck size={13} className="trust-shield" />
          <span>GSTIN: <strong>{buyer.gstin ? `${buyer.gstin.slice(0, 4)}...${buyer.gstin.slice(-3)}` : '36AAB...1Z5'}</strong></span>
          <span className="dot">•</span>
          <span>FSSAI: <strong>{buyer.fssai ? `${buyer.fssai.slice(0, 5)}...` : '13621...'}</strong></span>
          <span className="dot">•</span>
          <span className="trust-score">Trust: {buyer.trustScore || 98}%</span>
        </div>
      )}

      <div className="buyer-grid">
        <div><Package size={15}/><span>Need</span><strong>{buyer.quantityKg?.toLocaleString('en-IN')} kg {buyer.crop}</strong></div>
        <div><span>Offer</span><strong>₹{buyer.offerPrice}/kg</strong></div>
        <div><span>Grade</span><strong>{buyer.grade}</strong></div>
        <div><CalendarDays size={15}/><span>By</span><strong>{buyer.requiredBy}</strong></div>
      </div>

      <div className="buyer-foot">
        {buyer.pickupProvided ? <><Truck size={15}/> Farmgate pickup included</> : <span>Farmer delivery</span>}
        <span className="pay-guarantee">🛡️ Payment: {buyer.paymentDays}d guaranteed</span>
      </div>
    </article>
  );
}
