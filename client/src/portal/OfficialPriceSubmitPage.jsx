import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Save, AlertCircle, CheckCircle, ArrowLeft, Building2, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function OfficialPriceSubmitPage() {
  const { officialProfile, isVerifiedOfficial } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultMarketName = officialProfile?.assignedMarketNames?.[0] || 'Bowenpally Market';
  const defaultMarketId = officialProfile?.assignedMarketIds?.[0] || 'TS-Bowenpally Market';

  const [formData, setFormData] = useState({
    reportingDate: todayStr,
    state: 'Telangana',
    district: 'Hyderabad',
    marketId: defaultMarketId,
    marketName: defaultMarketName,
    commodityName: 'Tomato',
    variety: 'Hybrid',
    grade: 'Grade A',
    minPrice: '',
    maxPrice: '',
    modalPrice: '',
    arrivalQuantity: '',
    unit: '₹/Quintal',
    sourceReference: 'Daily APMC Physical Auction Sheet',
    remarks: ''
  });

  const [commodities, setCommodities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadCommodities() {
      try {
        const res = await api.commodities().catch(() => ({ commodities: ['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy', 'Turmeric', 'Bengal Gram', 'Maize'] }));
        const list = Array.isArray(res) ? res : (res.commodities || ['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy']);
        setCommodities(list.map(c => typeof c === 'string' ? c : c.commodityName || c.name));
      } catch (e) {
        setCommodities(['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy', 'Turmeric']);
      }
    }
    loadCommodities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const min = Number(formData.minPrice);
    const max = Number(formData.maxPrice);
    const modal = Number(formData.modalPrice);

    if (isNaN(min) || isNaN(max) || isNaN(modal)) {
      return 'Please enter valid numerical values for Min, Max, and Modal prices.';
    }
    if (min <= 0 || max <= 0 || modal <= 0) {
      return 'Prices must be greater than zero.';
    }
    if (min > max) {
      return 'Minimum price cannot exceed Maximum price.';
    }
    if (modal < min || modal > max) {
      return `Modal price (₹${modal}) must fall within the Minimum (₹${min}) and Maximum (₹${max}) price range.`;
    }
    return null;
  };

  const handleAction = async (isDraft = false) => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const payload = {
        ...formData,
        minPrice: Number(formData.minPrice),
        maxPrice: Number(formData.maxPrice),
        modalPrice: Number(formData.modalPrice),
        arrivalQuantity: Number(formData.arrivalQuantity || 0),
        isDraft
      };

      const res = await api.submitPrice(payload);
      setSuccessInfo({
        message: res.message,
        submissionId: res.submissionId,
        isDraft
      });
    } catch (err) {
      setErrorMessage(err.message || 'Price submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link to="/portal/official" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Back to Official Desk
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daily Mandi Price Update
          </h1>
        </div>
      </div>

      {!isVerifiedOfficial && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#92400e', fontSize: '0.88rem' }}>
          <strong>Note:</strong> Your official account is currently awaiting administrative verification. You can test saving <em>Drafts</em>, but publishing to public farmer feeds requires admin approval.
        </div>
      )}

      {successInfo && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle size={22} color="#16a34a" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#166534', fontWeight: 700 }}>
                {successInfo.message}
              </h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#166534' }}>
                Reference ID: <strong>{successInfo.submissionId}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/portal/official/submissions"
                  style={{ padding: '6px 12px', background: '#166534', color: '#fff', borderRadius: '6px', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
                >
                  View My Submissions
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessInfo(null);
                    setFormData(prev => ({ ...prev, minPrice: '', maxPrice: '', modalPrice: '', arrivalQuantity: '', remarks: '' }));
                  }}
                  style={{ padding: '6px 12px', background: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Enter Another Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleAction(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Market & Date Header Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                Assigned Mandi Yard
              </label>
              <input
                type="text"
                readOnly
                value={formData.marketName}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                Auction / Reporting Date *
              </label>
              <input
                type="date"
                required
                name="reportingDate"
                value={formData.reportingDate}
                onChange={handleChange}
                max={todayStr}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Commodity & Grade */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Commodity *
              </label>
              <select
                name="commodityName"
                value={formData.commodityName}
                onChange={handleChange}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}
              >
                {commodities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Variety / Cultivar
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Hybrid, Local, Desi"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Quality Grade
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="FAQ">FAQ (Fair Average Quality)</option>
                <option value="Mixed">Mixed Lots</option>
              </select>
            </div>
          </div>

          {/* Auction Price Fields */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Price Information ({formData.unit})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Min Price (₹/Quintal) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10}
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="e.g. 2200"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Modal Price (Most Traded) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10}
                  name="modalPrice"
                  value={formData.modalPrice}
                  onChange={handleChange}
                  placeholder="e.g. 2600"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '2px solid #059669', fontSize: '0.9rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Max Price (₹/Quintal) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10}
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  placeholder="e.g. 2800"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Arrivals (Quintals)
                </label>
                <input
                  type="number"
                  min={0}
                  name="arrivalQuantity"
                  value={formData.arrivalQuantity}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {formData.modalPrice && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                Equivalent per-kg farmer realization: ₹{(Number(formData.modalPrice) / 100).toFixed(2)}/kg
              </div>
            )}
          </div>

          {/* Reference & Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Auction Sheet / Ledger Ref
              </label>
              <input
                type="text"
                name="sourceReference"
                value={formData.sourceReference}
                onChange={handleChange}
                placeholder="e.g. APMC Auction Lot #104"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Market Condition Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. Heavy arrivals, high quality lots"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>Save as Draft</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
            >
              <Send size={15} />
              <span>Submit for Admin Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
