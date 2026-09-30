import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Scale, MapPin, Eye } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getInstruments } from '../../data/api.js';

const TYPE_ICONS = {
  'Platform Scale': '⚖️', 'Counter Scale': '🔢', 'Weighbridge': '🚛',
  'Fuel Dispenser': '⛽', 'Retail Scale': '🛒', 'Taxi Meter': '🚕',
};

export default function MyInstruments() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    getInstruments(currentUser.id).then(d => { setInstruments(d); setLoading(false); });
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner text="Loading instruments..." />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Instruments</h1>
          <p className="text-sm text-gray-500">{instruments.length} instrument{instruments.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 text-sm ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>List</button>
          </div>
          <button
            onClick={() => navigate('/owner/instruments/register')}
            className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} /> Register New
          </button>
        </div>
      </div>

      {instruments.length === 0 ? (
        <EmptyState
          title="No instruments registered"
          description="Register your weighing or measuring instruments to begin the verification process."
          action={
            <button onClick={() => navigate('/owner/instruments/register')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Register Instrument</button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {instruments.map(instr => (
            <InstrumentCard key={instr.instrumentId} instr={instr} onView={() => navigate(`/owner/instruments/${instr.instrumentId}`)} onApply={() => navigate('/owner/applications/apply', { state: { instrumentId: instr.instrumentId } })} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Instrument ID','Type','Manufacturer','Serial No.','Capacity','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {instruments.map(instr => (
                <tr key={instr.instrumentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-medium">{instr.instrumentId}</td>
                  <td className="px-4 py-3">{instr.type}</td>
                  <td className="px-4 py-3 text-gray-600">{instr.manufacturer}</td>
                  <td className="px-4 py-3 font-mono text-xs">{instr.serialNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{instr.capacity}</td>
                  <td className="px-4 py-3"><StatusBadge status={instr.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/owner/instruments/${instr.instrumentId}`)} className="text-indigo-600 hover:underline text-xs flex items-center gap-1">
                      <Eye size={12} /> View Passport
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InstrumentCard({ instr, onView, onApply }) {
  const emoji = TYPE_ICONS[instr.type] || '⚙️';
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{emoji}</div>
        <StatusBadge status={instr.status} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-0.5">{instr.type}</h3>
      <p className="text-xs text-gray-500 mb-3">{instr.manufacturer} · {instr.model}</p>
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex justify-between"><span className="text-gray-400">Instrument ID</span><span className="font-mono text-indigo-700 font-medium text-[10px]">{instr.instrumentId}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Serial No.</span><span className="font-mono">{instr.serialNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Capacity</span><span>{instr.capacity}</span></div>
        {instr.validUntil && <div className="flex justify-between"><span className="text-gray-400">Valid Until</span><span className={instr.status === 'Expired' ? 'text-red-600 font-medium' : ''}>{instr.validUntil}</span></div>}
      </div>
      <div className="flex items-center gap-2 mt-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={10} />{instr.registeredAddress?.split(',').slice(-2).join(',').trim()}</div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onView} className="flex-1 text-xs border border-indigo-200 text-indigo-700 rounded-lg py-1.5 hover:bg-indigo-50 transition-colors">View Passport</button>
        {['Expired','Verified','Expiring Soon'].includes(instr.status) && (
          <button onClick={onApply} className="flex-1 text-xs bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700 transition-colors">Apply Re-verification</button>
        )}
      </div>
    </div>
  );
}
