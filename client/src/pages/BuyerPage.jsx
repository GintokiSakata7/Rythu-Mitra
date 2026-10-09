import { useEffect, useState } from 'react';
import { ArrowRight, Factory, Filter, RefreshCw, Search, ShieldCheck, Sparkles, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import BuyerCard from '../components/BuyerCard.jsx';
import { api } from '../lib/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { translateCrop, getEnglishCropName } from '../lib/cropTranslations.js';

export default function BuyerPage() {
  const { t, language } = useLanguage();
  const [requirements, setRequirements] = useState([]);
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBuyers = (selectedCrop = '') => {
    setLoading(true);
    setError('');
    const englishCrop = getEnglishCropName(selectedCrop, language);
    api.buyers(englishCrop)
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
    { id: '', label: t('buyer_all_crops') },
    ...(dbCrops.length > 0 
      ? dbCrops.map(c => ({ id: c.name, label: translateCrop(c.name, language) }))
      : [
          { id: 'Tomato', label: translateCrop('Tomato', language) },
          { id: 'Onion', label: translateCrop('Onion', language) },
          { id: 'Potato', label: translateCrop('Potato', language) },
          { id: 'Chilli', label: translateCrop('Chilli', language) }
        ]
    )
  ];

  return (
    <div className="buyer-directory-page">
      {/* Page Header */}
      <SectionHeader
        eyebrow={t('buyer_eyebrow')}
        title={t('buyer_title')}
        description={t('buyer_desc')}
        action={
          <Link className="button button-primary" to="/post-requirement">
            <ShieldCheck size={16} />
            <span>{t('buyer_btn_post')}</span>
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
            <div className="bth-tag">{t('buyer_trust_tag')}</div>
            <h2>{t('buyer_trust_title')}</h2>
            <p>{t('buyer_trust_desc')}</p>
          </div>
        </div>

        <div className="bth-stats-strip">
          <div className="bth-stat-item">
            <strong>100%</strong>
            <span>{t('buyer_stat_1')}</span>
          </div>
          <div className="bth-stat-item">
            <strong>48-72h</strong>
            <span>{t('buyer_stat_2')}</span>
          </div>
          <div className="bth-stat-item">
            <strong>₹0</strong>
            <span>{t('buyer_stat_3')}</span>
          </div>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="buyer-filter-toolbar">
        <div className="bft-search-lead">
          <Search size={16} />
          <span>
            {t('buyer_open_req')}{' '}
            <strong className="count-pill">{requirements.length} {t('buyer_active')}</strong>
          </span>
        </div>

        <div className="buyer-search-wrapper" style={{ flex: 1, paddingLeft: '16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '28px', color: '#64748b' }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            className="buyer-search-input"
            placeholder={t('buyer_search_placeholder')}
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            list="buyer-crops-list"
          />
          <datalist id="buyer-crops-list">
            {crops.filter(c => c.id).map((c) => (
              <option key={c.id} value={c.label} />
            ))}
          </datalist>
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
          <p>{t('buyer_loading')}</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="buyer-empty-state">
          <Building2 size={36} />
          <h3>{t('buyer_empty_title')}</h3>
          <p>{t('buyer_empty_desc')}</p>
          <Link to="/post-requirement" className="button button-primary">
            <ShieldCheck size={16} /> {t('buyer_btn_post')}
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
          {t('buyer_footer')}
        </span>
      </div>
    </div>
  );
}
