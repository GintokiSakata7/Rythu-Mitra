import { useEffect, useState } from 'react';
import { ArrowRight, Factory, Filter, RefreshCw, Search, ShieldCheck, Sparkles, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import BuyerCard from '../components/BuyerCard.jsx';
import { api } from '../lib/api.js';

export default function BuyerPage() {
  const [requirements, setRequirements] = useState([]);
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBuyers = (selectedCrop = '') => {
    setLoading(true);
    setError('');
    api.buyers(selectedCrop)
      .then((res) => {
        setRequirements(res.requirements || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load buyer requirements.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBuyers(crop);
  }, [crop]);

  const [dbCrops, setDbCrops] = useState([]);
  useEffect(() => {
    api.commodities().then(res => {
      if (res && res.commodities) setDbCrops(res.commodities);
    }).catch(console.error);
  }, []);

  const crops = [
    { id: '', label: 'All Crops' },
    ...(dbCrops.length > 0 
      ? dbCrops.map(c => ({ id: c.name, label: c.name }))
      : [
          { id: 'Tomato', label: '🍅 Tomato' },
          { id: 'Onion', label: '🧅 Onion' },
          { id: 'Potato', label: '🥔 Potato' },
          { id: 'Chilli', label: '🌶️ Chilli' }
        ]
    )
  ];

  return (
    <div className="buyer-directory-page">
      {/* Page Header */}
      <SectionHeader
        eyebrow="DIRECT BUYER NETWORK"
        title="Verified Direct Buyers & Factory Procurement"
        description="Connect directly with verified food processors, restaurant groups, and institutional buyers. All listings are audited with Government GSTIN & FSSAI licenses to eliminate middlemen scams."
        action={
          <Link className="button button-primary" to="/post-requirement">
            <ShieldCheck size={16} />
            <span>Verify & Post Requirement</span>
            <ArrowRight size={16} />
          </Link>
        }
      />

      {/* Trust & KYB Guarantee Hero Banner */}
      <div className="buyer-trust-hero-card">
        <div className="bth-left">
          <div className="bth-icon-orbit">
            <ShieldCheck size={32} />
          </div>
          <div className="bth-text">
            <div className="bth-tag">100% GOVERNMENT-AUDITED DIRECT NETWORK</div>
            <h2>Zero-Fraud Protection & Guaranteed Payment Window</h2>
            <p>
              To protect smallholders, every buyer must verify their active <strong>GSTIN</strong> and <strong>FSSAI Food License</strong>,
              and execute binding legal covenants guaranteeing payment within 72 hours directly to the farmer with zero post-transit deductions.
            </p>
          </div>
        </div>

        <div className="bth-stats-strip">
          <div className="bth-stat-item">
            <strong>100%</strong>
            <span>Govt KYB Audited</span>
          </div>
          <div className="bth-stat-item">
            <strong>48-72h</strong>
            <span>Payment Window</span>
          </div>
          <div className="bth-stat-item">
            <strong>₹0</strong>
            <span>Middleman Cut</span>
          </div>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="buyer-filter-toolbar">
        <div className="bft-search-lead">
          <Search size={16} />
          <span>
            Open Requirements{' '}
            <strong className="count-pill">{requirements.length} Active</strong>
          </span>
        </div>

        <div className="bft-pills-group">
          {crops.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`crop-filter-pill ${crop === c.id ? 'active' : ''}`}
              onClick={() => setCrop(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button type="button" className="button button-ghost" onClick={() => fetchBuyers(crop)}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Directory Grid */}
      {loading ? (
        <div className="buyer-loading-state">
          <RefreshCw size={24} className="spin" />
          <p>Loading verified buyer network from Supabase database...</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="buyer-empty-state">
          <Building2 size={36} />
          <h3>No open requirements for {crop || 'this crop'} right now</h3>
          <p>Be the first commercial buyer to post a requirement for this commodity.</p>
          <Link to="/post-requirement" className="button button-primary">
            <ShieldCheck size={16} /> Verify & Post Requirement
          </Link>
        </div>
      ) : (
        <div className="buyer-cards-grid">
          {requirements.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </div>
      )}

      {/* Bottom Informational Note */}
      <div className="buyer-directory-footer-note">
        <Filter size={16} />
        <span>
          RythuMitra’s optimization engine evaluates these direct opportunities alongside local APMC mandis,
          factoring in distance, travel hours, spoilage risk, and farmgate pickup to maximize your net take-home realization.
        </span>
      </div>
    </div>
  );
}
