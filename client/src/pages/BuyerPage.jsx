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
    <SectionHeader eyebrow="DIRECT BUYER NETWORK" title="A better buyer may not be a mandi." description="Factories, processors, restaurants and food startups can publish live requirements. MandiMitra evaluates them alongside nearby markets." action={<Link className="button button-primary" to="/post-requirement">Post requirement <ArrowRight size={16}/></Link>} />
    <div className="buyer-intro panel"><div className="buyer-intro-icon"><Factory size={25}/></div><div><strong>Demand appears where contracts break or new kitchens open.</strong><p>We treat these requirements as opportunities — with price, quantity, pickup and deadline all part of the decision.</p></div><ShieldCheck size={22}/></div>
    <div className="toolbar"><div className="search-filter"><Search size={16}/><span>Open requirements</span></div><div className="filters"><button className={crop==='Tomato'?'filter active':'filter'} onClick={()=>setCrop('Tomato')}>Tomato</button><button className={crop===''?'filter active':'filter'} onClick={()=>setCrop('')}>All</button></div></div>
    {error && <div className="error-box">{error}</div>}
    <div className="buyer-list">{requirements.map(b=><BuyerCard key={b.id} buyer={b}/>)}</div>
    <div className="buyer-footer-note"><Filter size={16}/><span>Matching considers crop, quantity, location, pickup, travel and net realization — not just offer price.</span></div>
  </div>;
}
