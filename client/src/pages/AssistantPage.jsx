import VoiceFlow from '../components/VoiceFlow.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { Volume2 } from 'lucide-react';

export default function AssistantPage() {
  return (
    <div className="assistant-page-container">
      <SectionHeader
        eyebrow="MULTI-LINGUAL VOICE ASSISTANT"
        title="Interactive voice mode in Telugu, Hindi & English."
        description="The AI speaks sequential questions aloud, listens to farmer responses, and calculates the optimal net realization."
      />
      <VoiceFlow />
      <div className="ai-note" style={{ marginTop: '24px' }}>
        <Volume2 size={18} />
        <span>
          <strong>AI's role:</strong> Natural multi-lingual speech interaction and clear reasoning in Telugu, Hindi, or English.{' '}
          <strong>Optimizer's role:</strong> Accurate mathematical net realization balancing modal price, travel distance, time, and spoilage risk.
        </span>
      </div>
    </div>
  );
}
