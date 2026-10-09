import { useNavigate } from 'react-router-dom';
import VoiceFlow from '../components/VoiceFlow.jsx';

export default function AssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="assistant-page-container voice-page">
      <VoiceFlow onSwitchToManual={() => navigate('/find', { state: { mode: 'manual' } })} />
    </div>
  );
}
