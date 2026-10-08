import { CalendarDays, Factory, Package, Truck, ShieldCheck, BadgeCheck, ArrowRight, IndianRupee, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerCard({ buyer }) {
  const isVerified = buyer.isVerified ?? true;

  return (
    <article className="buyer-directory-card">
      {/* Top Header */}
      <div className="bdc-top">
        <div className="bdc-company-avatar">
          <Factory size={22} />
        </div>
        <div className="bdc-title-area">
          <div className="bdc-name-row">
            <h3>{buyer.companyName || buyer.company_name}</h3>
            {isVerified && (
              <span className="bdc-verified-badge" title="Government GSTIN & FSSAI Registered and Verified">
                <BadgeCheck size={14} /> Govt Verified
              </span>
            )}
          </div>
          <div className="bdc-sub-info">
            <span className="bdc-type-tag">{buyer.type}</span>
            <span className="bdc-dot">•</span>
            <span className="bdc-city">
              <MapPin size={12} /> {buyer.city || 'Telangana'}
            </span>
          </div>
        </div>
        <div className="bdc-status-pill">
          <span className="status-live-dot" />
          <span>{buyer.status || 'Active'}</span>
        </div>
      </div>

      {/* Trust & Government Registry Strip */}
      {isVerified && (
        <div className="bdc-trust-strip">
          <div className="bdc-trust-lead">
            <ShieldCheck size={14} className="shield-icon" />
            <span>KYB Audited:</span>
          </div>
          <div className="bdc-trust-tags">
            <span className="gov-id-tag">GSTIN: <strong>{buyer.gstin || '36AABCB1234M1Z5'}</strong></span>
            <span className="gov-id-tag">FSSAI: <strong>{buyer.fssai || '13621014000189'}</strong></span>
            <span className="trust-score-tag">Trust: <strong>{buyer.trustScore || 98}%</strong></span>
          </div>
        </div>
      )}

      {/* 4-Cell Metric Ledger Grid */}
      <div className="bdc-ledger-grid">
        <div className="bdc-cell">
          <div className="cell-header">
            <Package size={14} />
            <span>Quantity Needed</span>
          </div>
          <strong>{buyer.quantityKg?.toLocaleString('en-IN')} kg</strong>
          <small>{buyer.crop}</small>
        </div>

        <div className="bdc-cell price-cell">
          <div className="cell-header">
            <IndianRupee size={14} />
            <span>Offer Price</span>
          </div>
          <strong className="price-text">₹{buyer.offerPrice} <small>/ kg</small></strong>
          <small>Modal Benchmark</small>
        </div>

        <div className="bdc-cell">
          <div className="cell-header">
            <Sparkles size={14} />
            <span>Quality Grade</span>
          </div>
          <strong>Grade {buyer.grade || 'A'}</strong>
          <small>Transparent Assay</small>
        </div>

        <div className="bdc-cell">
          <div className="cell-header">
            <CalendarDays size={14} />
            <span>Needed By</span>
          </div>
          <strong>{buyer.requiredBy || 'Immediate'}</strong>
          <small>Delivery Target</small>
        </div>
      </div>

      {/* Logistics & Payment Guarantee Strip */}
      <div className="bdc-features-row">
        {buyer.pickupProvided ? (
          <span className="bdc-feature-pill pickup-yes">
            <Truck size={14} /> Farmgate Pickup Included
          </span>
        ) : (
          <span className="bdc-feature-pill pickup-no">
            <Truck size={14} /> Farmer Delivery to Facility
          </span>
        )}

        <span className="bdc-feature-pill payment-guarantee">
          <ShieldCheck size={14} /> {buyer.paymentDays ?? buyer.payment_days ?? 3}d Payment Guaranteed
        </span>
      </div>

      {/* Card Action Footer */}
      <div className="bdc-action-footer">
        <span className="bdc-officer-hint">
          Procurement: {buyer.officerName || 'Authorized Sourcing Lead'}
        </span>
        <Link
          to={`/find`}
          className="bdc-match-btn"
          title="Match your produce to this buyer requirement"
        >
          <span>Match Harvest</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
