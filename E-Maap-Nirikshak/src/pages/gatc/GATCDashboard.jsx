// GATC Dashboard — same structure as LMO
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipboardList, CheckCircle, Clock, TestTube } from 'lucide-react';
import StatCard from '../../components/shared/StatCard.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getApplications, getInspections } from '../../data/api.js';

const WEEKLY_DATA = [
  { day: 'Mon', completed: 1 }, { day: 'Tue', completed: 2 }, { day: 'Wed', completed: 0 },
  { day: 'Thu', completed: 3 }, { day: 'Fri', completed: 1 }, { day: 'Sat', completed: 2 }, { day: 'Sun', completed: 0 },
];

export default function GATCDashboard() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getApplications({ officerId: currentUser.id }),
      getInspections({ officerId: currentUser.id }),
    ]).then(([a, i]) => { setApps(a); setInspections(i); setLoading(false); });
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const scheduled = apps.filter(a => a.status === 'Scheduled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GATC Dashboard</h1>
        <p className="text-sm text-gray-500">{currentUser.name} · {currentUser.accreditation}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Allocated Tests" value={apps.length} color="indigo" />
        <StatCard icon={Clock} label="Scheduled" value={scheduled.length} color="blue" />
        <StatCard icon={CheckCircle} label="Completed" value={inspections.length} color="green" />
        <StatCard icon={TestTube} label="Pending Results" value={apps.filter(a => a.status === 'Inspected').length} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Scheduled Tests</h2>
            <button onClick={() => navigate('/gatc/assignments')} className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {scheduled.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No tests scheduled</p>
            ) : scheduled.map(app => (
              <div key={app.applicationId} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.instrumentId}</p>
                  <p className="text-xs text-gray-500">{app.scheduledDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <button onClick={() => navigate(`/gatc/inspect/${app.applicationId}`)}
                    className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-lg hover:bg-teal-700">
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tests This Week</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="completed" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
