import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getInspections, getInstruments } from '../../data/api.js';

export default function InspectionHistory() {
  const { currentUser } = useAppStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [insps, instrs] = await Promise.all([
        getInspections({ officerId: currentUser.id }),
        getInstruments(),
      ]);
      const enriched = insps.map(i => ({
        ...i,
        instr: instrs.find(x => x.instrumentId === i.instrumentId),
      }));
      setItems(enriched.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate)));
      setLoading(false);
    }
    load();
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner text="Loading history..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inspection History</h1>
        <p className="text-sm text-gray-500">{items.length} completed inspection{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No completed inspections yet" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Inspection ID','Instrument','Type','Date','GPS Delta','Result'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.inspectionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700">{item.inspectionId}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.instr?.type}</p>
                      <p className="text-xs font-mono text-gray-400">{item.instrumentId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.instr?.type}</td>
                  <td className="px-4 py-3 text-gray-500">{item.submittedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${item.gpsDeltaMeters > 200 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.gpsDeltaMeters}m {item.gpsDeltaMeters > 200 ? '⚠️' : '✓'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.result} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
