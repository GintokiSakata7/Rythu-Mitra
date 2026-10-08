import { CheckCircle2, ChevronRight, Database, Search, ShieldCheck } from 'lucide-react';

export default function OptimizerTrace({ search }) {
  if (!search) return null;
  return (
    <div className="trace-card">
      <div className="trace-head"><div><div className="eyebrow">SEARCH EFFICIENCY</div><h3>The engine stopped when the economics stopped making sense.</h3></div><ShieldCheck size={24}/></div>
      <div className="trace-stats">
        <Metric icon={<Database size={16}/>} label="Data calls" value={search.apiLikeCalls} />
        <Metric icon={<Search size={16}/>} label="Candidates" value={search.candidatesEvaluated} />
        <Metric icon={<ChevronRight size={16}/>} label="Levels used" value={search.levelsUsed} />
      </div>
      <div className="timeline">
        {search.trace?.map((step) => (
          <div className="timeline-row" key={step.level}>
            <div className="timeline-dot"><CheckCircle2 size={16}/></div>
            <div><strong>Level {step.level}</strong><span>{step.candidatesReturned} nearby candidates · best {step.bestOpportunity} · {step.gapPct}% gap</span></div>
          </div>
        ))}
      </div>
      <div className="stop-reason"><span>STOP CONDITION</span>{search.stopReason}</div>
    </div>
  );
}

function Metric({ icon, label, value }) { return <div><span>{icon}{label}</span><strong>{value}</strong></div>; }
