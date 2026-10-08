import { useState } from 'react';
import {
  Building2, CheckCircle2, Factory, MapPinned, Truck, ShieldCheck,
  ShieldAlert, Lock, Unlock, BadgeCheck, FileText, ArrowRight,
  ArrowLeft, Sparkles, AlertTriangle, Check, RefreshCw, Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../lib/api.js';

export default function PostRequirementPage() {
  const [step, setStep] = useState(1); // 1: Govt Verification, 2: Farmer Agreement, 3: Publish Requirement, 4: Done

  // Step 1: Verification Form
  const [verificationForm, setVerificationForm] = useState({
    companyName: 'Deccan Fresh Foods Pvt Ltd',
    type: 'Food Processor',
    gstin: '36AABCB1234M1Z5',
    fssai: '13621014000189',
    cin: 'U15139TG2020PTC145678',
    officerName: 'Suresh Reddy',
    phone: '+91 98490 12345',
    email: 'procurement@deccanfoods.in'
  });
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verifiedData, setVerifiedData] = useState(null);

  // Step 2: Agreement State
  const [agreedGovtId, setAgreedGovtId] = useState(false);
  const [agreedFairTrade, setAgreedFairTrade] = useState(false);
  const [agreedGuaranteedPay, setAgreedGuaranteedPay] = useState(false);
  const [signatoryName, setSignatoryName] = useState('Suresh Reddy');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Head of Agricultural Procurement');
  const [agreementError, setAgreementError] = useState('');
  const [agreementSigned, setAgreementSigned] = useState(false);

  // Step 3: Requirement Form
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
    paymentDays: 3
  });
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishedRecord, setPublishedRecord] = useState(null);

  // Auto-fill sample enterprise
  const loadSampleCredentials = (type = 'processor') => {
    if (type === 'processor') {
      setVerificationForm({
        companyName: 'Deccan Fresh Foods Pvt Ltd',
        type: 'Food Processor',
        gstin: '36AABCB1234M1Z5',
        fssai: '13621014000189',
        cin: 'U15139TG2020PTC145678',
        officerName: 'Suresh Reddy',
        phone: '+91 98490 12345',
        email: 'procurement@deccanfoods.in'
      });
    } else {
      setVerificationForm({
        companyName: 'Urban Bowl Kitchens Ltd',
        type: 'Restaurant Group',
        gstin: '36AAACU5678K1Z2',
        fssai: '13622015000451',
        cin: 'U55101TG2019PLC098234',
        officerName: 'Vikram Joshi',
        phone: '+91 94401 56789',
        email: 'supplies@urbanbowl.com'
      });
    }
  };

  // Handle Step 1 Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationError('');
    try {
      const res = await api.verifyBuyer(verificationForm);
      setVerifiedData(res);
      setSignatoryName(res.officerName || verificationForm.officerName);
    } catch (err) {
      setVerificationError(err.message || 'Verification failed. Please check Government ID formats.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle Step 2 Sign-off
  const handleSignAgreement = (e) => {
    e.preventDefault();
    if (!agreedGovtId || !agreedFairTrade || !agreedGuaranteedPay) {
      setAgreementError('You must check and agree to all farmer protection covenants before proceeding.');
      return;
    }
    if (!signatoryName.trim()) {
      setAgreementError('Authorized signatory name is required.');
      return;
    }
    setAgreementError('');
    setAgreementSigned(true);
    setStep(3); // unlock requirement posting
  };

  // Handle Step 3 Publishing
  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setPublishError('');
    try {
      const payload = {
        companyName: verificationForm.companyName,
        type: verificationForm.type,
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
        // Verification & Anti-fraud metadata
        isVerified: true,
        verificationId: verifiedData?.verificationId || `MM-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        gstin: verifiedData?.gstin || verificationForm.gstin,
        fssai: verifiedData?.fssai || verificationForm.fssai,
        trustScore: verifiedData?.trustScore || 98,
        officerName: signatoryName,
        agreedToTerms: true
      };
      const res = await api.postBuyer(payload);
      setPublishedRecord(res.requirement);
      setStep(4);
    } catch (err) {
      setPublishError(err.message || 'Failed to publish requirement.');
    } finally {
      setPublishing(false);
    }
  };

  const isVerified = Boolean(verifiedData?.success);

  return (
    <div className="post-requirement-page">
      <SectionHeader
        eyebrow="VERIFIED BUYER PORTAL"
        title="Direct Buyer Verification & Requirement Publishing"
        description="To eliminate fraudulent listings and protect farmers from payment default, buyers must verify their Government registration (GSTIN & FSSAI) and execute the Farmer Protection Agreement before requirements are activated."
      />

      {/* Progress Stepper */}
      <div className="verification-stepper">
        <div className={`step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 1 ? <Check size={16} /> : '1'}</div>
          <div className="step-text">
            <strong>Govt Verification</strong>
            <small>GSTIN & FSSAI KYB</small>
          </div>
        </div>

        <div className="step-connector" />

        <div className={`step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 2 ? <Check size={16} /> : '2'}</div>
          <div className="step-text">
            <strong>Farmer Agreement</strong>
            <small>Anti-fraud covenants</small>
          </div>
        </div>

        <div className="step-connector" />

        <div className={`step-node ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 3 ? <Check size={16} /> : '3'}</div>
          <div className="step-text">
            <strong>Post Requirement</strong>
            <small>Crops & Logistics</small>
          </div>
        </div>
      </div>

      {/* ================= STEP 1: GOVT VERIFICATION ================= */}
      {step === 1 && (
        <div className="verification-card panel">
          <div className="verification-header">
            <div className="header-icon-box shield-glow">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="eyebrow-chip">RYTHUMITRA TRUST PROTOCOL</div>
              <h2>Step 1: Verify Government Registration Credentials</h2>
              <p>
                To safeguard smallholder farmers from middlemen fraud, we verify that your enterprise holds active
                Goods and Services Tax (GSTIN) and Food Safety (FSSAI) registrations.
              </p>
            </div>
          </div>

          <div className="demo-quickfill-bar">
            <span>Test with Sample Credentials:</span>
            <button
              type="button"
              className="quickfill-btn"
              onClick={() => loadSampleCredentials('processor')}
            >
              <Sparkles size={13} /> Deccan Fresh Foods (Processing)
            </button>
            <button
              type="button"
              className="quickfill-btn"
              onClick={() => loadSampleCredentials('kitchen')}
            >
              <Sparkles size={13} /> Urban Bowl Kitchens (Hospitality)
            </button>
          </div>

          <form onSubmit={handleVerify} className="verification-form">
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
                  value={verificationForm.type}
                  onChange={(e) => setVerificationForm({ ...verificationForm, type: e.target.value })}
                >
                  <option value="Food Processor">Food Processor / Factory</option>
                  <option value="Restaurant Group">Restaurant Group / Commercial Kitchen</option>
                  <option value="Processing Unit">Agri Processing Unit</option>
                  <option value="Modern Retailer">Modern Retailer / Supermarket</option>
                  <option value="Agri Exporter">Agricultural Exporter</option>
                </select>
              </Field>
            </div>

            <div className="form-grid two">
              <Field
                label="GSTIN (15-Digit Goods & Services Tax No.)"
                caption="e.g. 36AABCB1234M1Z5 (Telangana State Code: 36)"
                required
              >
                <input
                  type="text"
                  value={verificationForm.gstin}
                  onChange={(e) => setVerificationForm({ ...verificationForm, gstin: e.target.value.toUpperCase() })}
                  placeholder="36AABCB1234M1Z5"
                  maxLength={15}
                  required
                />
              </Field>

              <Field
                label="FSSAI Food License Number (14 Digits)"
                caption="Food Safety & Standards Authority of India Registration"
                required
              >
                <input
                  type="text"
                  value={verificationForm.fssai}
                  onChange={(e) => setVerificationForm({ ...verificationForm, fssai: e.target.value })}
                  placeholder="13621014000189"
                  maxLength={14}
                  required
                />
              </Field>
            </div>

            <div className="form-grid three">
              <Field label="CIN / MSME Udyam Number (Optional)">
                <input
                  type="text"
                  value={verificationForm.cin}
                  onChange={(e) => setVerificationForm({ ...verificationForm, cin: e.target.value })}
                  placeholder="U15139TG2020PTC145678"
                />
              </Field>

              <Field label="Procurement Officer Name" required>
                <input
                  type="text"
                  value={verificationForm.officerName}
                  onChange={(e) => setVerificationForm({ ...verificationForm, officerName: e.target.value })}
                  placeholder="Official Representative"
                  required
                />
              </Field>

              <Field label="Official Contact Phone" required>
                <input
                  type="text"
                  value={verificationForm.phone}
                  onChange={(e) => setVerificationForm({ ...verificationForm, phone: e.target.value })}
                  placeholder="+91 98490 12345"
                  required
                />
              </Field>
            </div>

            {verificationError && (
              <div className="error-box">
                <AlertTriangle size={18} />
                <span>{verificationError}</span>
              </div>
            )}

            {/* Verified Certificate Display if Verified */}
            {isVerified && (
              <div className="verified-certificate-card">
                <div className="cert-top">
                  <div className="cert-badge">
                    <BadgeCheck size={22} />
                    <div>
                      <strong>GOVERNMENT CREDENTIALS VERIFIED</strong>
                      <span>RythuMitra KYB Level 1 Verified</span>
                    </div>
                  </div>
                  <span className="trust-pill">Trust Score: {verifiedData.trustScore}/100</span>
                </div>

                <div className="cert-grid">
                  <div>
                    <small>Entity Legal Name</small>
                    <strong>{verifiedData.companyName}</strong>
                  </div>
                  <div>
                    <small>Verification ID</small>
                    <strong>{verifiedData.verificationId}</strong>
                  </div>
                  <div>
                    <small>GSTIN Registry Status</small>
                    <span className="status-badge success">
                      <Check size={12} /> {verifiedData.gstinStatus} ({verifiedData.state})
                    </span>
                  </div>
                  <div>
                    <small>FSSAI Food License</small>
                    <span className="status-badge success">
                      <Check size={12} /> {verifiedData.fssaiStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-action-row">
              <button
                type="submit"
                className="button button-primary"
                disabled={verifying}
              >
                {verifying ? (
                  <>Verifying against Govt Registry...</>
                ) : isVerified ? (
                  <>
                    <RefreshCw size={16} /> Re-verify Credentials
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} /> Verify Govt Credentials
                  </>
                )}
              </button>

              {isVerified && (
                <button
                  type="button"
                  className="button button-accent"
                  onClick={() => setStep(2)}
                >
                  <span>Proceed to Farmer Protection Agreement</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 2: FARMER PROTECTION AGREEMENT ================= */}
      {step === 2 && (
        <div className="agreement-card panel">
          <div className="verification-header">
            <div className="header-icon-box scale-glow">
              <Scale size={28} />
            </div>
            <div>
              <div className="eyebrow-chip">LEGAL COMMITMENT</div>
              <h2>Step 2: Execute Farmer Protection & Fair Trade Agreement</h2>
              <p>
                To eliminate distress sales and prevent exploitative practices, all registered buyers must
                legally bind themselves to transparent settlement and anti-default covenants.
              </p>
            </div>
          </div>

          <div className="legal-covenants-box">
            <div className="covenant-item">
              <div className="covenant-num">1</div>
              <div>
                <strong>Guaranteed Payment Window (చెల్లింపు హామీ / भुगतान गारंटी)</strong>
                <p>
                  The buyer guarantees 100% full disbursement of the agreed produce value within the stated
                  settlement window (maximum 72 hours) directly to the farmer’s bank account or UPI upon delivery.
                  Deferred or arbitrary delays are strictly prohibited.
                </p>
              </div>
            </div>

            <div className="covenant-item">
              <div className="covenant-num">2</div>
              <div>
                <strong>Farmgate / Delivery Assay Transparency (పారదర్శక నాణ్యత పరీక్ష)</strong>
                <p>
                  Quality grading (Grade A, B+, B) must adhere strictly to objective agreed parameters upon
                  arrival. Arbitrary post-transit price reductions or opportunistic rejections after the farmer
                  has traveled are contractually forbidden.
                </p>
              </div>
            </div>

            <div className="covenant-item">
              <div className="covenant-num">3</div>
              <div>
                <strong>Anti-Fraud Legal Declaration (మోసపూరిత చర్యల నిరోధక చట్టం)</strong>
                <p>
                  Submitting fraudulent requirements, intentional default on crop payments, or impersonating
                  commercial entities invokes immediate platform blacklisting, forfeiture of deposit, and legal
                  referral under the APMC Agricultural Produce Contract Act and Section 318 of BNS (Bharatiya Nyaya Sanhita).
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignAgreement} className="agreement-form">
            <div className="affirmations-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedGovtId}
                  onChange={(e) => setAgreedGovtId(e.target.checked)}
                />
                <span>
                  I affirm under penalty of law that the Government Registration IDs (GSTIN: {verificationForm.gstin} / FSSAI: {verificationForm.fssai}) legally belong to our registered entity and are in active standing.
                </span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedFairTrade}
                  onChange={(e) => setAgreedFairTrade(e.target.checked)}
                />
                <span>
                  I agree to the RythuMitra Fair Trade Standards and warrant that grading will follow objective standards with zero post-transit predatory cuts.
                </span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedGuaranteedPay}
                  onChange={(e) => setAgreedGuaranteedPay(e.target.checked)}
                />
                <span>
                  I guarantee prompt financial settlement within {reqForm.paymentDays} days directly to the supplying farmer.
                </span>
              </label>
            </div>

            <div className="digital-signature-grid">
              <Field label="Authorized Signatory Full Name" required>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. Suresh Reddy"
                  required
                />
              </Field>

              <Field label="Designation in Entity" required>
                <input
                  type="text"
                  value={signatoryDesignation}
                  onChange={(e) => setSignatoryDesignation(e.target.value)}
                  placeholder="e.g. Head of Agricultural Procurement"
                  required
                />
              </Field>

              <Field label="Execution Date & Timestamp">
                <input
                  type="text"
                  value={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  disabled
                />
              </Field>
            </div>

            {agreementError && (
              <div className="error-box">
                <AlertTriangle size={18} />
                <span>{agreementError}</span>
              </div>
            )}

            <div className="form-action-row">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} /> Back to Step 1
              </button>

              <button
                type="submit"
                className="button button-primary"
              >
                <Unlock size={17} /> Accept Covenants & Unlock Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 3: PUBLISH REQUIREMENT ================= */}
      {step === 3 && (
        <div className="post-form-card panel">
          <div className="verification-header">
            <div className="header-icon-box unlock-glow">
              <BadgeCheck size={28} />
            </div>
            <div>
              <div className="eyebrow-chip success">LISTING UNLOCKED & VERIFIED</div>
              <h2>Step 3: Publish Crop Procurement Requirement</h2>
              <p>
                Publishing as: <strong>{verificationForm.companyName}</strong> (GSTIN: {verificationForm.gstin} · Trust: 98%).
                Your listing will feature the <strong>Govt Verified Buyer</strong> trust seal.
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

            <div className="form-section">
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
                  placeholder="e.g. Hyderabad, Bhongir"
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

            {/* Farmgate pickup incentive */}
            <label className="check-row wide pickup-incentive-box">
              <input
                type="checkbox"
                checked={reqForm.pickupProvided}
                onChange={(e) => setReqForm({ ...reqForm, pickupProvided: e.target.checked })}
              />
              <span>
                <strong>🚚 We Provide Pickup Directly at Farmer's Farmgate</strong>
                <small>
                  Offering pickup eliminates the farmer's transport deduction completely, making your requirement
                  rank at the top of RythuMitra’s optimization engine!
                </small>
              </span>
            </label>

            {publishError && (
              <div className="error-box">
                <AlertTriangle size={18} />
                <span>{publishError}</span>
              </div>
            )}

            <div className="form-action-row">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={16} /> Back to Agreement
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={publishing}
              >
                {publishing ? (
                  <>Publishing with Trust Seal...</>
                ) : (
                  <>
                    <ShieldCheck size={17} /> Publish Verified Requirement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 4: SUCCESS CERTIFICATE ================= */}
      {step === 4 && (
        <div className="success-card panel">
          <div className="success-icon-orbit">
            <CheckCircle2 size={44} />
          </div>
          <div className="eyebrow-chip success">ACTIVATED ON NETWORK</div>
          <h2>Requirement Verified & Successfully Published!</h2>
          <p>
            Your procurement requirement is live on the RythuMitra Direct Buyer Network with the{' '}
            <strong>Govt Verified Buyer Trust Seal</strong>.
          </p>

          <div className="published-summary-box">
            <div className="summary-row">
              <span>Company:</span>
              <strong>{verificationForm.companyName}</strong>
            </div>
            <div className="summary-row">
              <span>Verification ID:</span>
              <code>{publishedRecord?.verificationId || verifiedData?.verificationId}</code>
            </div>
            <div className="summary-row">
              <span>GSTIN / FSSAI:</span>
              <span>{verificationForm.gstin} / {verificationForm.fssai}</span>
            </div>
            <div className="summary-row">
              <span>Crop Demand:</span>
              <strong>{reqForm.quantityKg?.toLocaleString('en-IN')} kg {reqForm.crop} @ ₹{reqForm.offerPrice}/kg</strong>
            </div>
            <div className="summary-row">
              <span>Logistics:</span>
              <span>{reqForm.pickupProvided ? '🚚 Buyer Farmgate Pickup Included' : 'Farmer Delivery'}</span>
            </div>
            <div className="summary-row">
              <span>Payment Commitment:</span>
              <strong>Guaranteed within {reqForm.paymentDays} days</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/buyers" className="button button-primary">
              <EyeIcon size={16} /> View in Live Buyer Directory
            </Link>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setStep(3);
                setPublishedRecord(null);
              }}
            >
              Post Another Crop Requirement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, caption, required = false, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label} {required && <span className="req-star">*</span>}
      </span>
      {caption && <small className="field-caption">{caption}</small>}
      {children}
    </label>
  );
}

function EyeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
