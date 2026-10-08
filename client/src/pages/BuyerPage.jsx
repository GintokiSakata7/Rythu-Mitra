import { useEffect, useState } from 'react';
import { ArrowRight, Factory, Filter, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import BuyerCard from '../components/BuyerCard.jsx';
import { api } from '../lib/api.js';

export default function BuyerPage() {
  const [requirements, setRequirements] = useState([]);
  const [crop, setCrop] = useState('Tomato');
  const [error, setError] = useState('');
  useEffect(() => { api.buyers(crop).then(x=>setRequirements(x.requirements)).catch(e=>setError(e.message)); }, [crop]);
  return <div>
    <SectionHeader
      eyebrow="DIRECT BUYER NETWORK"
      title="Verified Direct Buyers with Payment Guarantee."
      description="Factories, processors, and commercial buyers with verified Government GSTIN & FSSAI licenses. MandiMitra matches direct requirements to save farmers travel and middleman commissions."
      action={<Link className="button button-primary" to="/post-requirement"><ShieldCheck size={16}/> Verify & Post Requirement <ArrowRight size={16}/></Link>}
    />
    <div className="buyer-intro panel">
      <div className="buyer-intro-icon"><Factory size={25}/></div>
      <div>
        <strong>100% Government-Verified Direct Buyers (GSTIN & FSSAI Audited).</strong>
        <p>All buyers undergo KYB verification and sign binding Farmer Protection Agreements guaranteeing payment within 72 hours with zero arbitrary post-transit deductions.</p>
      </div>
      <ShieldCheck size={26} color="#10b981" />
    </div>
    <div className="toolbar"><div className="search-filter"><Search size={16}/><span>Open Verified Requirements</span></div><div className="filters"><button className={crop==='Tomato'?'filter active':'filter'} onClick={()=>setCrop('Tomato')}>Tomato</button><button className={crop===''?'filter active':'filter'} onClick={()=>setCrop('')}>All</button></div></div>
    {error && <div className="error-box">{error}</div>}
    <div className="buyer-list">{requirements.map(b=><BuyerCard key={b.id} buyer={b}/>)}</div>
    <div className="buyer-footer-note"><Filter size={16}/><span>Matching considers crop, quantity, location, pickup, travel and net realization — not just offer price.</span></div>
  </div>;
}
