import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, Save, AlertCircle, CheckCircle, ArrowLeft, 
  Plus, X, CheckCircle2, PackagePlus 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';

const POPULAR_CROPS = [
  'Garlic', 'Ginger', 'Wheat', 'Groundnut', 'Cotton', 'Turmeric',
  'Cabbage', 'Cauliflower', 'Capsicum', 'Maize', 'Soybean',
  'Green Gram', 'Black Gram', 'Red Chilli', 'Paddy', 'Potato',
  'Carrot', 'Coriander', 'Mustard', 'Brinjal', 'Bitter Gourd'
];

export default function OfficialPriceSubmitPage() {
  const { officialProfile, isVerifiedOfficial } = useAuth();

  const minPriceInputRef = useRef(null);
  const priceSectionRef = useRef(null);
  const commoditySelectRef = useRef(null);

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

  // Inline action status right above the buttons
  const [inlineActionError, setInlineActionError] = useState('');
  const [inlineActionSuccess, setInlineActionSuccess] = useState('');
  const [highlightPrices, setHighlightPrices] = useState(false);

  // Add Item Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVariety, setNewItemVariety] = useState('Hybrid');
  const [newItemGrade, setNewItemGrade] = useState('Grade A');
  const [newItemUnit, setNewItemUnit] = useState('₹/Quintal');
  const [addingItem, setAddingItem] = useState(false);
  const [itemModalError, setItemModalError] = useState('');
  const [itemToast, setItemToast] = useState(null);

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
    if (name === 'commodityName' && value === '__ADD_NEW__') {
      setItemModalError('');
      setShowAddModal(true);
      return;
    }
    // Clear feedback when typing
    setInlineActionError('');
    setErrorMessage('');
    setHighlightPrices(false);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCommodity = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setItemModalError('Please enter a commodity name.');
      return;
    }
    setAddingItem(true);
    setItemModalError('');
    try {
      await api.createCommodity({
        commodityName: trimmed,
        variety: newItemVariety.trim() || 'Hybrid',
        grade: newItemGrade || 'Grade A',
        canonicalUnit: newItemUnit || '₹/Quintal'
      });

      // Update local commodities list if not already present
      setCommodities(prev => {
        const exists = prev.some(c => c.toLowerCase() === trimmed.toLowerCase());
        return exists ? prev : [trimmed, ...prev];
      });

      // Select newly added commodity in the form immediately
      setFormData(prev => ({
        ...prev,
        commodityName: trimmed,
        variety: newItemVariety.trim() || prev.variety,
        grade: newItemGrade || prev.grade,
        unit: newItemUnit || prev.unit
      }));

      setItemToast(`"${trimmed}" added successfully to mandi catalog and selected for today's price report!`);
      setTimeout(() => setItemToast(null), 6000);
      setShowAddModal(false);
      setNewItemName('');
    } catch (err) {
      setItemModalError(err.message || 'Failed to add commodity item.');
    } finally {
      setAddingItem(false);
    }
  };

  const validate = () => {
    if (!formData.commodityName || !formData.commodityName.trim()) {
      return 'Please select or add a commodity first.';
    }

    const minStr = String(formData.minPrice || '').trim();
    const modalStr = String(formData.modalPrice || '').trim();
    const maxStr = String(formData.maxPrice || '').trim();

    if (!minStr || !modalStr || !maxStr) {
      return `Please enter the Min, Modal, and Max prices for ${formData.commodityName} before saving.`;
    }

    const min = Number(minStr);
    const max = Number(maxStr);
    const modal = Number(modalStr);

    if (isNaN(min) || isNaN(max) || isNaN(modal) || min <= 0 || max <= 0 || modal <= 0) {
      return 'Prices must be positive numbers greater than 0.';
    }
    if (min > max) {
      return 'Minimum price cannot exceed Maximum price.';
    }
    if (modal < min || modal > max) {
      return `Modal price (₹${modal}) must fall within the Min (₹${min}) and Max (₹${max}) price range.`;
    }
    return null;
  };

  const handleAction = async (isDraft = false, andAddNext = false) => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setInlineActionError(validationError);
      setHighlightPrices(true);
      // Auto-focus min price input and scroll into view smoothly
      setTimeout(() => {
        if (minPriceInputRef.current) {
          minPriceInputRef.current.focus();
        }
        if (priceSectionRef.current) {
          priceSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setInlineActionError('');
    setInlineActionSuccess('');
    setHighlightPrices(false);
    setSuccessInfo(null);

    // If official is awaiting approval, automatically treat as Draft so it never 403s
    const effectiveIsDraft = isDraft || !isVerifiedOfficial;

    try {
      const payload = {
        ...formData,
        minPrice: Number(formData.minPrice),
        maxPrice: Number(formData.maxPrice),
        modalPrice: Number(formData.modalPrice),
        arrivalQuantity: Number(formData.arrivalQuantity || 0),
        isDraft: effectiveIsDraft
      };

      const res = await api.submitPrice(payload);

      if (andAddNext) {
        const savedCommodity = formData.commodityName;
        const savedModal = formData.modalPrice;
        const msg = effectiveIsDraft && !isVerifiedOfficial
          ? `✓ Draft lot saved for ${savedCommodity} (Modal: ₹${savedModal}/${formData.unit})! Form ready for next crop.`
          : `✓ Submitted price for ${savedCommodity} successfully (Lot #${res.submissionId.slice(-6)})! Form ready for next crop.`;

        setInlineActionSuccess(msg);
        setItemToast(msg);
        setTimeout(() => {
          setInlineActionSuccess('');
          setItemToast(null);
        }, 7000);

        // Reset price fields for next commodity, keep date and yard
        setFormData(prev => {
          const curIndex = commodities.findIndex(c => c.toLowerCase() === prev.commodityName.toLowerCase());
          const nextCommodity = (curIndex >= 0 && curIndex + 1 < commodities.length) ? commodities[curIndex + 1] : prev.commodityName;

          return {
            ...prev,
            commodityName: nextCommodity,
            minPrice: '',
            maxPrice: '',
            modalPrice: '',
            arrivalQuantity: '',
            remarks: ''
          };
        });

        // Focus commodity select or min price
        setTimeout(() => {
          if (commoditySelectRef.current) {
            commoditySelectRef.current.focus();
          }
        }, 80);
      } else {
        setSuccessInfo({
          message: res.message || (effectiveIsDraft ? 'Draft saved successfully.' : 'Price submitted for review.'),
          submissionId: res.submissionId,
          isDraft: effectiveIsDraft
        });
      }
    } catch (err) {
      const errMsg = err.message || 'Price submission failed.';
      setErrorMessage(errMsg);
      setInlineActionError(errMsg);
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

      {itemToast && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontWeight: 600 }}>{itemToast}</span>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        <form onSubmit={(e) => { e.preventDefault(); handleAction(false, false); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                ref={commoditySelectRef}
                name="commodityName"
                value={formData.commodityName}
                onChange={handleChange}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}
              >
                {commodities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__ADD_NEW__" style={{ fontWeight: 'bold', color: '#059669' }}>
                  ➕ Add New Commodity / Crop...
                </option>
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
          <div
            ref={priceSectionRef}
            style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              border: highlightPrices ? '2px solid #ef4444' : '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              boxShadow: highlightPrices ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: highlightPrices ? '#b91c1c' : '#0f172a' }}>
                Price Information ({formData.unit}) *
              </div>
              {highlightPrices && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  ⚠️ Prices Required to Save Item
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: highlightPrices && !formData.minPrice ? '#dc2626' : '#475569', marginBottom: '4px' }}>
                  Min Price ({formData.unit}) *
                </label>
                <input
                  ref={minPriceInputRef}
                  type="number"
                  required
                  min={0}
                  step={10}
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="e.g. 2200"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: highlightPrices && !formData.minPrice ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: highlightPrices && !formData.minPrice ? '#fff5f5' : '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: highlightPrices && !formData.modalPrice ? '#dc2626' : '#475569', marginBottom: '4px' }}>
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
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: highlightPrices && !formData.modalPrice ? '2px solid #ef4444' : '2px solid #059669',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: highlightPrices && !formData.modalPrice ? '#fff5f5' : '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: highlightPrices && !formData.maxPrice ? '#dc2626' : '#475569', marginBottom: '4px' }}>
                  Max Price ({formData.unit}) *
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
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: highlightPrices && !formData.maxPrice ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: highlightPrices && !formData.maxPrice ? '#fff5f5' : '#fff'
                  }}
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

          {/* Action Feedback Banners (Right above buttons for immediate visibility) */}
          {inlineActionError && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #f87171',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#991b1b',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#dc2626" />
                <span style={{ fontWeight: 600 }}>{inlineActionError}</span>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddModal(true); setInlineActionError(''); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fca5a5',
                  background: '#ffffff',
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Or Register Another Item
              </button>
            </div>
          )}

          {inlineActionSuccess && (
            <div style={{
              background: '#ecfdf5',
              border: '1.5px solid #34d399',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#065f46',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={20} color="#059669" />
              <span style={{ fontWeight: 700 }}>{inlineActionSuccess}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleAction(true, false)}
              style={{
                padding: '10px 16px',
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
              type="button"
              disabled={submitting}
              onClick={() => handleAction(false, true)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1.5px solid #059669',
                background: '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(5, 150, 105, 0.1)'
              }}
              title="Save this commodity price and immediately continue entering next crop"
            >
              <Plus size={16} />
              <span>{submitting ? 'Saving...' : 'Save & Add Next Item'}</span>
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
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Review'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add New Commodity Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackagePlus size={20} color="#34d399" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>Add New Mandi Commodity / Item</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Register to Mandi catalog & immediately submit rates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNewCommodity} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {itemModalError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} /> {itemModalError}
                </div>
              )}

              {/* Quick suggestion chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Quick Add Popular Crops (Click to Fill)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', padding: '4px 0' }}>
                  {POPULAR_CROPS.map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setNewItemName(crop)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: newItemName.toLowerCase() === crop.toLowerCase() ? '1.5px solid #059669' : '1px solid #cbd5e1',
                        background: newItemName.toLowerCase() === crop.toLowerCase() ? '#ecfdf5' : '#f8fafc',
                        color: newItemName.toLowerCase() === crop.toLowerCase() ? '#047857' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: newItemName.toLowerCase() === crop.toLowerCase() ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s'
                      }}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Commodity Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Garlic, Ginger, Wheat..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Default Variety
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hybrid, Desi"
                    value={newItemVariety}
                    onChange={(e) => setNewItemVariety(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Quality Grade
                  </label>
                  <select
                    value={newItemGrade}
                    onChange={(e) => setNewItemGrade(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Canonical Unit
                </label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="₹/Quintal">₹/Quintal (Standard 100 kg)</option>
                  <option value="₹/Kg">₹/Kg (Per Kilogram)</option>
                  <option value="₹/Bag">₹/Bag (50 kg Bag)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: addingItem ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={15} /> {addingItem ? 'Adding...' : 'Add & Select Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

