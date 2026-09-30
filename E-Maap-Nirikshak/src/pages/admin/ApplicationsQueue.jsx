import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getApplications, getLMOs, getGATCs, getInstruments, getOwners, allocateApplication } from '../../data/api.js';

export default function ApplicationsQueue() {
  const { addToast } = useAppStore();
  const [apps, setApps] = useState([]);
  const [lmos, setLmos] = useState([]);
  const [gatcs, setGatcs] = useState([]);
  const [instrs, setInstrs] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocModal, setAllocModal] = useState(null);
  const [allocOfficer, setAllocOfficer] = useState('');
  const [allocType, setAllocType] = useState('lmo');
  const [schedDate, setSchedDate] = useState('');
  const [allocating, setAllocating] = useState(false);

  async function load() {
    const [a, l, g, i, o] = await Promise.all([getApplications(), getLMOs(), getGATCs(), getInstruments(), getOwners()]);
    setApps(a.sort((x, y) => y.submittedDate.localeCompare(x.submittedDate)));
    setLmos(l); setGatcs(g); setInstrs(i); setOwners(o);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleAllocate = async () => {
    setAllocating(true);
    await allocateApplication(allocModal.applicationId, allocOfficer, allocType, schedDate);
    await load();
    setAllocModal(null);
    setAllocating(false);
    addToast('Inspection allocated and scheduled successfully!', 'success');
  };

  // Auto-suggest officer based on jurisdiction
  const suggestOfficer = (instr) => {
    const owner = owners.find(o => o.id === instr?.ownerId);
    const matchLMO = lmos.find(l => l.jurisdiction === owner?.state);
    return matchLMO?.id;
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications Queue</h1>
        <p className="text-sm text-gray-500">Manage and allocate verification applications</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All','Submitted','Under Review','Scheduled','Certified','Rejected'].map(s => {
          const count = s === 'All' ? apps.length : apps.filter(a => a.status === s).length;
          return (
            <button key={s} className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Application ID','Instrument','Owner','Type','Submitted','Assigned To','Status','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.map(app => {
              const instr = instrs.find(i => i.instrumentId === app.instrumentId);
              const owner = owners.find(o => o.id === app.ownerId);
              const officer = [...lmos, ...gatcs].find(x => x.id === app.assignedOfficerId);
              return (
                <tr key={app.applicationId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-medium">{app.applicationId}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-xs">{instr?.type}</p>
                      <p className="text-[10px] font-mono text-gray-400">{app.instrumentId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{owner?.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.type} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{app.submittedDate}</td>
                  <td className="px-4 py-3 text-xs">{officer?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3">
                    {['Submitted','Under Review'].includes(app.status) && (
                      <button
                        onClick={() => {
                          setAllocModal(app);
                          const suggested = suggestOfficer(instr);
                          if (suggested) setAllocOfficer(suggested);
                          setSchedDate(new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
                        }}
                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                      >Allocate</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Allocation Modal */}
      {allocModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Allocate Inspection</h3>
              <button onClick={() => setAllocModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Application:</span>
                <span className="font-mono text-indigo-700 font-semibold">{allocModal.applicationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Instrument:</span>
                <span className="font-medium text-gray-800">{allocModal.instrumentId}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200 flex items-start justify-between gap-2">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Shop Inspection Site:</span>
                  <p className="text-gray-800 font-medium text-[11px] leading-tight max-w-[230px]">
                    {allocModal.shopAddress || instrs.find(i => i.instrumentId === allocModal.instrumentId)?.registeredAddress || 'Delhi'}
                  </p>
                </div>
                <a
                  href={allocModal.shopLocation?.mapsUrl || `https://www.google.com/maps?q=${instrs.find(i => i.instrumentId === allocModal.instrumentId)?.lat || 28.6562},${instrs.find(i => i.instrumentId === allocModal.instrumentId)?.lng || 77.2310}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-[11px] font-semibold shrink-0"
                >
                  Maps 🗺️
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Assign To</label>
                <div className="flex gap-2 mb-2">
                  {['lmo', 'gatc'].map(t => (
                    <button key={t} onClick={() => { setAllocType(t); setAllocOfficer(''); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${allocType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600'}`}
                    >{t.toUpperCase()}</button>
                  ))}
                </div>
                <select value={allocOfficer} onChange={e => setAllocOfficer(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="">— Select {allocType.toUpperCase()} —</option>
                  {(allocType === 'lmo' ? lmos : gatcs).map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.jurisdiction || o.district})</option>
                  ))}
                </select>
                {allocOfficer && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={10} /> Auto-suggested based on jurisdiction
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Schedule Date *</label>
                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAllocModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAllocate} disabled={!allocOfficer || !schedDate || allocating}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
                {allocating ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
