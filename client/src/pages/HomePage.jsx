import {
  ArrowRight, Factory, Gauge, IndianRupee, Mic2, Search,
  ShieldCheck, Sparkles, Truck, Wheat, Edit3, Volume2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import BottomCallout from '../components/BottomCallout.jsx';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page-container">
      {/* Hero Header */}
      <section className="mobile-hero-panel">
        <div className="hero-top-badge">
          <Sparkles size={16} />
          <span>PROGRESSIVE MARKET-SEARCH OPTIMIZER</span>
        </div>

        <h1 className="hero-main-title">
          Find the market that pays you best <em>after</em> the journey.
        </h1>
        <p className="hero-sub-text">
          MandiMitra searches nearby mandis and direct buyers only as far as the economics justify — balancing market price, transport, travel time, and spoilage risk.
        </p>

        {/* PRIMARY SIDE-BY-SIDE ENTRY MODES */}
        <div className="home-entry-modes-grid">
          {/* Card 1: Voice Mode */}
          <Link to="/find" className="home-mode-card voice-card-accent">
            <div className="mode-card-icon-bubble voice-pulse">
              <Mic2 size={26} />
            </div>
            <div className="mode-card-content">
              <div className="mode-title-tag">
                <h3>Voice Mode</h3>
                <span className="lang-bubble">తెలుగు • हिंदी • EN</span>
              </div>
              <p>Speak naturally in Telugu, Hindi or English. The assistant asks questions and finds your best mandi.</p>
              <div className="mode-card-cta">
                <span>Start Voice Search</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Card 2: Manually Enter */}
          <Link to="/find" state={{ mode: 'manual' }} className="home-mode-card manual-card-accent">
            <div className="mode-card-icon-bubble">
              <Edit3 size={24} />
            </div>
            <div className="mode-card-content">
              <div className="mode-title-tag">
                <h3>Manually Enter</h3>
                <span className="manual-bubble">Fast Form</span>
              </div>
              <p>Input your crop, quantity, quality, and location with 1-click GPS detection to run the engine.</p>
              <div className="mode-card-cta">
                <span>Fill Details</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>

        <div className="proof-pills-row">
          <span><ShieldCheck size={15} /> Transparent net math</span>
          <span><Gauge size={15} /> Progressive radius search</span>
          <span><IndianRupee size={15} /> Real profit in hand</span>
        </div>
      </section>

      {/* Difference Explanation */}
      <SectionHeader
        eyebrow="THE CORE DIFFERENCE"
        title="Higher price is not necessarily higher profit."
        description="MandiMitra treats market selection as a transportation economics problem, not just a price bulletin."
      />

      <div className="stats-grid">
        <StatCard
          icon={<Search size={19} />}
          label="Search Strategy"
          value="5 → 15 → Expand"
          note="Expands only when farther markets can beat local net"
        />
        <StatCard
          icon={<IndianRupee size={19} />}
          label="Objective"
          value="Max Net Realization"
          note="Expected Sale - Freight - Travel Time - Spoilage"
          tone="sand"
        />
        <StatCard
          icon={<Truck size={19} />}
          label="Travel Aware"
          value="Freight & Road Time"
          note="Especially calibrated for perishable commodities"
          tone="blue"
        />
        <StatCard
          icon={<Factory size={19} />}
          label="Opportunity Set"
          value="Mandis + Buyers"
          note="APMC markets, food factories & restaurant buyers"
          tone="rose"
        />
      </div>

      <BottomCallout
        title="Ready to test with your harvest?"
        text="Choose Voice Mode to speak in Telugu or Hindi, or Manually Enter to test custom crop volumes."
      />
    </div>
  );
}
