import { useEffect, useState } from 'react';
import { AlertTriangle, Flag, TrendingUp, MapPin } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getRiskScores, flagForInspection } from '../../data/api.js';

function RiskBar({ score }) {
  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 w-20">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 70 ? 'text-red-600' : score >= 40 ? 'text-amber-600' : 'text-green-600'}`}>{score}</span>
    </div>
  );
}

export default function Enforcement() {
  const { addToast } = useAppStore();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getRiskScores().then(d => { setRisks(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleFlag = async (instrumentId) => {
    await flagForInspection(instrumentId);
    setRisks(r => r.map(x => x.instrumentId === instrumentId ? { ...x, flagged: true } : x));
    addToast('Instrument flagged for priority inspection.', 'warning');
  };

  if (loading) return <LoadingSpinner text="Loading risk assessment..." />;

  const high = risks.filter(r => r.riskScore >= 70);
  const medium = risks.filter(r => r.riskScore >= 40 && r.riskScore < 70);
  const low = risks.filter(r => r.riskScore < 40);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enforcement & Risk Dashboard</h1>
        <p className="text-sm text-gray-500">AI-powered risk scoring to prioritize enforcement activities</p>
      </div>

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{high.length}</p>
          <p className="text-sm text-red-700 font-medium mt-1">High Risk</p>
          <p className="text-xs text-red-500">Score ≥ 70</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{medium.length}</p>
          <p className="text-sm text-amber-700 font-medium mt-1">Medium Risk</p>
          <p className="text-xs text-amber-500">Score 40–69</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{low.length}</p>
          <p className="text-sm text-green-700 font-medium mt-1">Low Risk</p>
          <p className="text-xs text-green-500">Score &lt; 40</p>
        </div>
      </div>

      {/* Mock geographic cluster */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-gray-400" />Geographic Risk Map</h2>
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Simulated map with risk cluster dots */}
          <div className="text-center z-10">
            <p className="text-4xl mb-1">🗺️</p>
            <p className="text-xs text-gray-600 font-medium">Risk Cluster Map</p>
          </div>
          {/* Cluster blobs */}
          <div className="absolute top-8 left-16 w-12 h-12 bg-red-400/40 rounded-full blur-sm" />
          <div className="absolute top-6 left-14 w-3 h-3 bg-red-600 rounded-full" title="Delhi" />
          <div className="absolute top-5 left-13 text-[8px] text-red-700 font-bold">Delhi ⚠️</div>
          <div className="absolute top-20 left-32 w-8 h-8 bg-amber-400/40 rounded-full blur-sm" />
          <div className="absolute top-20 left-32 w-2.5 h-2.5 bg-amber-600 rounded-full" />
          <div className="absolute bottom-10 right-20 w-6 h-6 bg-amber-400/30 rounded-full blur-sm" />
          <div className="absolute bottom-10 right-20 w-2 h-2 bg-amber-500 rounded-full" />
          <div className="absolute bottom-8 left-24 w-5 h-5 bg-green-400/30 rounded-full blur-sm" />
          <div className="absolute bottom-8 left-24 w-2 h-2 bg-green-500 rounded-full" />
          <div className="absolute top-4 right-10 flex gap-3 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" />High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" />Low</span>
          </div>
        </div>
      </div>

      {/* Risk table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Risk-Ranked Instruments</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Instrument','Type','Owner','State','Risk Score','Repeat Failures','Complaints','Days Since Verify','Flagged','Action'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.map(r => (
              <tr key={r.instrumentId} className={`hover:bg-gray-50 ${r.riskScore >= 70 ? 'bg-red-50/50' : r.riskScore >= 40 ? 'bg-amber-50/30' : ''}`}>
                <td className="px-3 py-3 font-mono text-xs text-indigo-700">{r.instrumentId}</td>
                <td className="px-3 py-3 text-xs">{r.instrumentType}</td>
                <td className="px-3 py-3 text-xs font-medium">{r.ownerName}</td>
                <td className="px-3 py-3 text-xs">{r.state}</td>
                <td className="px-3 py-3"><RiskBar score={r.riskScore} /></td>
                <td className="px-3 py-3 text-center text-xs font-semibold text-red-600">{r.repeatFailures}</td>
                <td className="px-3 py-3 text-center text-xs font-semibold text-amber-600">{r.complaintCount}</td>
                <td className="px-3 py-3 text-center text-xs">{r.daysSinceVerification}d</td>
                <td className="px-3 py-3">
                  {r.flagged ? (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><Flag size={12} />Flagged</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {!r.flagged && (
                    <button onClick={() => handleFlag(r.instrumentId)}
                      className="flex items-center gap-1 text-xs border border-red-200 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50">
                      <AlertTriangle size={10} /> Flag
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
