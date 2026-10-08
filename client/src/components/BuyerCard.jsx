import { CalendarDays, Factory, Package, Truck } from 'lucide-react';

export default function BuyerCard({ buyer }) {
  return <article className="buyer-card">
    <div className="buyer-top"><div className="company-icon"><Factory size={19}/></div><div><h3>{buyer.companyName}</h3><p>{buyer.type}</p></div><span className="open-pill">{buyer.status}</span></div>
    <div className="buyer-grid">
      <div><Package size={15}/><span>Need</span><strong>{buyer.quantityKg.toLocaleString('en-IN')} kg {buyer.crop}</strong></div>
      <div><span>Offer</span><strong>₹{buyer.offerPrice}/kg</strong></div>
      <div><span>Grade</span><strong>{buyer.grade}</strong></div>
      <div><CalendarDays size={15}/><span>By</span><strong>{buyer.requiredBy}</strong></div>
    </div>
    <div className="buyer-foot">{buyer.pickupProvided ? <><Truck size={15}/> Pickup provided</> : <span>Farmer delivery</span>}<span>Payment {buyer.paymentDays}d</span></div>
  </article>;
}
