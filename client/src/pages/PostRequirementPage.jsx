import { useState, useEffect } from 'react';
import {
  Building2, CheckCircle2, Factory, MapPinned, Truck, ShieldCheck,
  ShieldAlert, Lock, Unlock, BadgeCheck, FileText, ArrowRight,
  ArrowLeft, Sparkles, AlertTriangle, Check, RefreshCw, Scale,
  Trash2, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../lib/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function PostRequirementPage() {
  const { t } = useLanguage();
  const { user, isBuyer, login, register, buyerProfile } = useAuth();
  
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [verificationForm, setVerificationForm] = useState({
    companyName: '',
    buyerType: 'Food Processor',
    gstin: '',
    fssai: '',
    cin: '',
    officerName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [requirements, setRequirements] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Requirement form
  const [reqForm, setReqForm] = useState({
    crop: 'Tomato',
    quantityKg: 5000,
    grade: 'A',
    offerPrice: 29,
    city: 'Hyderabad',
    latitude: 17.39,
    longitude: 78.48,
    pickupProvided: true,
    requiredBy: '2026-10-15',
    paymentDays: 3,
    agreedToTerms: false
  });
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  // Auto-fill sample enterprise
  const loadSampleCredentials = (type = 'processor') => {
    if (type === 'processor') {
      setVerificationForm({
        companyName: 'Deccan Fresh Foods Pvt Ltd',
        buyerType: 'Food Processor',
        gstin: '36AABCB1234M1Z5',
        fssai: '13621014000189',
        cin: 'U15139TG2020PTC145678',
        officerName: 'Suresh Reddy',
        phone: '+91 98490 12345',
        email: 'procurement@deccanfoods.in',
        password: 'password123'
      });
    } else {
      setVerificationForm({
        companyName: 'Urban Bowl Kitchens Ltd',
        buyerType: 'Restaurant Group',
        gstin: '36AAACU5678K1Z2',
        fssai: '13622015000451',
        cin: 'U55101TG2019PLC098234',
        officerName: 'Vikram Joshi',
        phone: '+91 94401 56789',
        email: 'supplies@urbanbowl.com',
        password: 'password123'
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await register({
        fullName: verificationForm.officerName,
        email: verificationForm.email,
        phone: verificationForm.phone,
        password: verificationForm.password,
        role: 'buyer',
        companyName: verificationForm.companyName,
        buyerType: verificationForm.buyerType,
        gstin: verificationForm.gstin,
        fssai: verificationForm.fssai,
        cin: verificationForm.cin,
        officerName: verificationForm.officerName
      });
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadRequirements = async () => {
    if (!isBuyer) return;
    setLoadingReqs(true);
    try {
      const res = await api.getMyRequirements();
      setRequirements(res.requirements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    if (isBuyer) {
      loadRequirements();
      setShowCreateForm(false);
    }
  }, [isBuyer]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!reqForm.agreedToTerms) {
      setPublishError('You must agree to the Farmer Protection terms.');
      return;
    }
    setPublishing(true);
    setPublishError('');
    try {
      const payload = {
        companyName: buyerProfile?.companyName || user.fullName,
        type: buyerProfile?.type || 'Buyer',
        crop: reqForm.crop,
        quantityKg: Number(reqForm.quantityKg),
        grade: reqForm.grade,
        offerPrice: Number(reqForm.offerPrice),
        city: reqForm.city,
        latitude: Number(reqForm.latitude),
        longitude: Number(reqForm.longitude),
        pickupProvided: Boolean(reqForm.pickupProvided),
        requiredBy: reqForm.requiredBy,
        paymentDays: Number(reqForm.paymentDays),
        isVerified: true,
        verificationId: `MM-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        gstin: buyerProfile?.gstin,
        fssai: buyerProfile?.fssai,
        trustScore: 98,
        officerName: buyerProfile?.officerName || user.fullName,
        agreedToTerms: true
      };
      await api.postBuyer(payload);
      setShowCreateForm(false);
      loadRequirements();
    } catch (err) {
      setPublishError(err.message || 'Failed to publish requirement.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await api.deleteRequirement(id);
        loadRequirements();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  // Auth View (Login / Register)
  if (!user || !isBuyer) {
    return (
      <div className="post-requirement-page">
        <SectionHeader
          eyebrow="VERIFIED BUYER PORTAL"
          title="Direct Buyer Verification"
          description="Login or register with Government IDs to publish crop requirements."
        />

        <div className="verification-card panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="verification-header">
            <div className="header-icon-box shield-glow">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="eyebrow-chip">SECURE ACCESS</div>
              <h2>{authMode === 'login' ? 'Buyer Login' : 'New Buyer Registration'}</h2>
              <p>
                {authMode === 'login' 
                  ? 'Access your buyer dashboard to manage requirements.'
                  : 'Verify your Government registration (GSTIN & FSSAI) to join.'}
              </p>
            </div>
          </div>

          <div className="auth-toggle-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button"
              className={`button ${authMode === 'login' ? 'button-primary' : 'button-ghost'}`} 
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button 
              type="button"
              className={`button ${authMode === 'register' ? 'button-primary' : 'button-ghost'}`} 
              onClick={() => setAuthMode('register')}
            >
              Sign Up (KYB)
            </button>
          </div>

          {authError && (
            <div className="error-box" style={{ marginBottom: '20px' }}>
              <AlertTriangle size={18} />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="verification-form">
              <div className="form-grid">
                <Field label="Email Address" required>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Password" required>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="form-action-row" style={{ marginTop: '20px' }}>
                <button type="submit" className="button button-primary" disabled={authLoading} style={{ width: '100%' }}>
                  {authLoading ? <RefreshCw size={16} className="spin" /> : <Lock size={16} />}
                  <span>Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="demo-quickfill-bar" style={{ marginBottom: '20px' }}>
                <span>Test with Sample Credentials:</span>
                <button type="button" className="quickfill-btn" onClick={() => loadSampleCredentials('processor')}>
                  <Sparkles size={13} /> Deccan Fresh
                </button>
                <button type="button" className="quickfill-btn" onClick={() => loadSampleCredentials('kitchen')}>
                  <Sparkles size={13} /> Urban Bowl
                </button>
              </div>

              <form onSubmit={handleRegister} className="verification-form">
                <div className="form-grid two">
                  <Field label="Legal Entity / Factory Name" required>
                    <input
                      type="text"
                      value={verificationForm.companyName}
                      onChange={(e) => setVerificationForm({ ...verificationForm, companyName: e.target.value })}
                      placeholder="e.g. Deccan Fresh Foods Pvt Ltd"
                      required
                    />
                  </Field>
                  <Field label="Business Category" required>
                    <select
                      value={verificationForm.buyerType}
                      onChange={(e) => setVerificationForm({ ...verificationForm, buyerType: e.target.value })}
                    >
                      <option value="Food Processor">Food Processor / Factory</option>
                      <option value="Restaurant Group">Restaurant Group / Commercial Kitchen</option>
                      <option value="Modern Retailer">Modern Retailer / Supermarket</option>
                    </select>
                  </Field>
                </div>

                <div className="form-grid two">
                  <Field label="GSTIN" caption="15-Digit Goods & Services Tax No." required>
                    <input
                      type="text"
                      value={verificationForm.gstin}
                      onChange={(e) => setVerificationForm({ ...verificationForm, gstin: e.target.value.toUpperCase() })}
                      required
                    />
                  </Field>
                  <Field label="FSSAI" caption="Food Safety License Number" required>
                    <input
                      type="text"
                      value={verificationForm.fssai}
                      onChange={(e) => setVerificationForm({ ...verificationForm, fssai: e.target.value })}
                      required
                    />
                  </Field>
                </div>

                <div className="form-grid two">
                  <Field label="Procurement Officer Name" required>
                    <input
                      type="text"
                      value={verificationForm.officerName}
                      onChange={(e) => setVerificationForm({ ...verificationForm, officerName: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Contact Phone" required>
                    <input
                      type="text"
                      value={verificationForm.phone}
                      onChange={(e) => setVerificationForm({ ...verificationForm, phone: e.target.value })}
                      required
                    />
                  </Field>
                </div>

                <div className="form-grid two">
                  <Field label="Email Account" required>
                    <input
                      type="email"
                      value={verificationForm.email}
                      onChange={(e) => setVerificationForm({ ...verificationForm, email: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Account Password" required>
                    <input
                      type="password"
                      value={verificationForm.password}
                      onChange={(e) => setVerificationForm({ ...verificationForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </Field>
                </div>

                <div className="form-action-row" style={{ marginTop: '20px' }}>
                  <button type="submit" className="button button-primary" disabled={authLoading} style={{ width: '100%' }}>
                    {authLoading ? <RefreshCw size={16} className="spin" /> : <ShieldCheck size={16} />}
                    <span>Verify & Register Account</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="post-requirement-page">
      <SectionHeader
        eyebrow="VERIFIED BUYER DASHBOARD"
        title={`Welcome, ${buyerProfile?.companyName || user.fullName}`}
        description="Manage your active crop procurement requirements."
        action={
          !showCreateForm && (
            <button className="button button-primary" onClick={() => setShowCreateForm(true)}>
              <Plus size={16} />
              <span>Post New Requirement</span>
            </button>
          )
        }
      />

      {showCreateForm ? (
        <div className="post-form-card panel">
          <div className="verification-header">
            <div className="header-icon-box unlock-glow">
              <BadgeCheck size={28} />
            </div>
            <div>
              <div className="eyebrow-chip success">LISTING UNLOCKED & VERIFIED</div>
              <h2>Publish Crop Procurement Requirement</h2>
              <p>
                Publishing as: <strong>{buyerProfile?.companyName}</strong> (GSTIN: {buyerProfile?.gstin}).
              </p>
            </div>
          </div>

          <form onSubmit={handlePublish} className="requirement-form">
            <div className="form-section">
              <div className="section-icon">
                <Factory size={19} />
              </div>
              <div>
                <h3>Produce Demand Details</h3>
                <p>Specify crop, target quantity and offer price.</p>
              </div>
            </div>

            <div className="form-grid three">
              <Field label="Crop Name" required>
                <select
                  value={reqForm.crop}
                  onChange={(e) => setReqForm({ ...reqForm, crop: e.target.value })}
                >
                  <option value="Tomato">Tomato (టమాట)</option>
                  <option value="Onion">Onion (ఉల్లిపాయ)</option>
                  <option value="Potato">Potato (బంగాళాదుంప)</option>
                  <option value="Chilli">Chilli (మిరప)</option>
                  <option value="Cotton">Cotton (పత్తి)</option>
                </select>
              </Field>

              <Field label="Required Quantity (kg)" required>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={reqForm.quantityKg}
                  onChange={(e) => setReqForm({ ...reqForm, quantityKg: e.target.value })}
                  required
                />
              </Field>

              <Field label="Offer Price (₹/kg)" required>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={reqForm.offerPrice}
                  onChange={(e) => setReqForm({ ...reqForm, offerPrice: e.target.value })}
                  required
                />
              </Field>

              <Field label="Required Quality Grade">
                <select
                  value={reqForm.grade}
                  onChange={(e) => setReqForm({ ...reqForm, grade: e.target.value })}
                >
                  <option value="A">Grade A (Premium / Firm)</option>
                  <option value="B+">Grade B+ (Processing Grade)</option>
                  <option value="B">Grade B (Standard)</option>
                </select>
              </Field>

              <Field label="Needed By Date" required>
                <input
                  type="date"
                  value={reqForm.requiredBy}
                  onChange={(e) => setReqForm({ ...reqForm, requiredBy: e.target.value })}
                  required
                />
              </Field>

              <Field label="Payment Settlement (Days)" required>
                <select
                  value={reqForm.paymentDays}
                  onChange={(e) => setReqForm({ ...reqForm, paymentDays: e.target.value })}
                >
                  <option value={1}>1 Day (Immediate)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Standard)</option>
                </select>
              </Field>
            </div>

            <div className="form-section" style={{ marginTop: '20px' }}>
              <div className="section-icon">
                <Truck size={19} />
              </div>
              <div>
                <h3>Delivery & Logistics Facility</h3>
                <p>Location parameters for the optimizer engine.</p>
              </div>
            </div>

            <div className="form-grid three">
              <Field label="Facility City / District" required>
                <input
                  type="text"
                  value={reqForm.city}
                  onChange={(e) => setReqForm({ ...reqForm, city: e.target.value })}
                  required
                />
              </Field>
              <Field label="Latitude" required>
                <input
                  type="number"
                  step="0.0001"
                  value={reqForm.latitude}
                  onChange={(e) => setReqForm({ ...reqForm, latitude: e.target.value })}
                  required
                />
              </Field>
              <Field label="Longitude" required>
                <input
                  type="number"
                  step="0.0001"
                  value={reqForm.longitude}
                  onChange={(e) => setReqForm({ ...reqForm, longitude: e.target.value })}
                  required
                />
              </Field>
            </div>

            <label className="check-row wide pickup-incentive-box" style={{ marginTop: '20px' }}>
              <input
                type="checkbox"
                checked={reqForm.pickupProvided}
                onChange={(e) => setReqForm({ ...reqForm, pickupProvided: e.target.checked })}
              />
              <span>
                <strong>🚚 We Provide Pickup Directly at Farmer's Farmgate</strong>
                <small>
                  Offering pickup eliminates the farmer's transport deduction completely.
                </small>
              </span>
            </label>

            <div className="legal-covenants-box" style={{ marginTop: '20px' }}>
              <label className="checkbox-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={reqForm.agreedToTerms}
                  onChange={(e) => setReqForm({ ...reqForm, agreedToTerms: e.target.checked })}
                />
                <span>
                  <strong>Farmer Protection Agreement:</strong> I guarantee prompt financial settlement within {reqForm.paymentDays} days directly to the supplying farmer. I agree to the RythuMitra Fair Trade Standards.
                </span>
              </label>
            </div>

            {publishError && (
              <div className="error-box" style={{ marginTop: '20px' }}>
                <AlertTriangle size={18} />
                <span>{publishError}</span>
              </div>
            )}

            <div className="form-action-row" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={publishing}
              >
                {publishing ? 'Publishing...' : 'Publish Verified Requirement'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="requirements-dashboard">
          {loadingReqs ? (
            <div className="buyer-loading-state" style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw size={24} className="spin" />
              <p>Loading your requirements...</p>
            </div>
          ) : requirements.length === 0 ? (
            <div className="buyer-empty-state panel" style={{ textAlign: 'center', padding: '40px' }}>
              <FileText size={36} color="#94a3b8" />
              <h3>No Active Requirements</h3>
              <p>You haven't posted any crop requirements yet.</p>
              <button className="button button-primary" style={{ marginTop: '20px' }} onClick={() => setShowCreateForm(true)}>
                Post Your First Requirement
              </button>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ display: 'grid', gap: '20px' }}>
              {requirements.map((req) => (
                <div key={req.id} className="panel flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{req.quantityKg} kg {req.crop} @ ₹{req.offerPrice}/kg</h3>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      <span className="status-badge success" style={{ marginRight: '10px' }}>{req.status}</span>
                      Required By: {req.requiredBy} • {req.city} {req.pickupProvided ? '(Pickup Provided)' : ''}
                    </div>
                  </div>
                  <button 
                    className="button button-ghost" 
                    onClick={() => handleDelete(req.id)}
                    style={{ color: '#ef4444' }}
                    title="Delete Requirement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, caption, required = false, children }) {
  return (
    <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span className="field-label" style={{ fontWeight: 600 }}>
        {label} {required && <span className="req-star" style={{ color: '#ef4444' }}>*</span>}
      </span>
      {caption && <small className="field-caption" style={{ color: '#64748b' }}>{caption}</small>}
      {children}
    </label>
  );
}
