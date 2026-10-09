import { useLanguage } from '../contexts/LanguageContext.jsx';
import { Mic2, Radio } from 'lucide-react';
import { getSharedVoiceAudioContext } from './VoiceFlow.jsx';

export default function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();

  if (language) return null;

  const handleSelect = (langCode) => {
    // Unlock AudioContext immediately upon user interaction
    const ctx = getSharedVoiceAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    
    changeLanguage(langCode);
  };

  return (
    <div className="language-selector-overlay">
      <div className="language-selector-modal">
        <div className="language-logo">
          <img src="/logo.png" alt="RythuMitra Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>
        <h2>{t('lang_welcome')}</h2>
        <p>{t('lang_select')}</p>
        
        <div className="language-options">
          <button onClick={() => handleSelect('te')} className="lang-option-btn">
            <strong>తెలుగు</strong>
            <span>Telugu</span>
          </button>
          <button onClick={() => handleSelect('hi')} className="lang-option-btn">
            <strong>हिंदी</strong>
            <span>Hindi</span>
          </button>
          <button onClick={() => handleSelect('en')} className="lang-option-btn">
            <strong>English</strong>
            <span>English</span>
          </button>
        </div>

        <div className="language-note">
          <Mic2 size={16} /> {t('lang_note')}
        </div>
      </div>
    </div>
  );
}
