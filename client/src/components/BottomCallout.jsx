import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BottomCallout({ title, text, to = '/find' }) {
  return <div className="bottom-callout"><div><div className="eyebrow">NEXT MOVE</div><h2>{title}</h2><p>{text}</p></div><Link className="button button-light" to={to}>Open tool <ArrowRight size={17}/></Link></div>;
}
