import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, BarChart3 } from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';
import { getAdminStats } from '../../data/api.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';

export default function Reports() {
  const { addToast } = useAppStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;

  const handleExport = (type) => {
    addToast(`${type} report export initiated (demo — no file generated)`, 'info');
  };

  const REPORT_TYPES = [
    { title: 'Monthly Verification Report', desc: 'Summary of all verifications conducted in the current month', format: 'PDF' },
    { title: 'Pendency Report', desc: 'Applications pending allocation or inspection', format: 'XLSX' },
    { title: 'Certificate Expiry Report', desc: 'Certificates expiring in the next 30/60/90 days', format: 'PDF' },
    { title: 'Officer Performance Report', desc: 'LMO and GATC inspection activity and turnaround time', format: 'PDF' },
    { title: 'Enforcement Action Report', desc: 'Flagged instruments and compliance actions taken', format: 'PDF' },
    { title: 'State-wise Compliance Report', desc: 'Verification and certification status by state', format: 'XLSX' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Generate and export system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-gray-400" />Verification Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.verificationsByMonth} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="verifications" stroke="#6D28D9" strokeWidth={2} dot={{ r: 4 }} name="Total" />
              <Line type="monotone" dataKey="passed" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} name="Passed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by State */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">State-wise Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.applicationsByState} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#1E3A8A" radius={[0, 4, 4, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report types */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REPORT_TYPES.map(r => (
            <div key={r.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><FileText size={16} className="text-indigo-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                  <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{r.format}</span>
                </div>
              </div>
              <button onClick={() => handleExport(r.title)}
                className="flex items-center gap-1.5 text-xs border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-50 shrink-0 ml-4">
                <Download size={12} /> Export
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
