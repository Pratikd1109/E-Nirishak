import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Scale, Users, FileText, Award, AlertTriangle, UserCheck, Building2, TrendingUp } from 'lucide-react';
import StatCard from '../../components/shared/StatCard.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import { getAdminStats } from '../../data/api.js';

const PIE_COLORS = ['#22C55E', '#EF4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  const passFailData = [
    { name: 'Passed', value: stats.completedVerifications },
    { name: 'Pending/Failed', value: stats.pendingVerifications },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
        <p className="text-sm text-gray-500">System-wide overview — Legal Metrology Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Scale} label="Total Instruments" value={stats.totalInstruments} color="indigo" />
        <StatCard icon={Users} label="Registered Owners" value={stats.totalOwners} color="blue" />
        <StatCard icon={FileText} label="Total Applications" value={stats.totalApplications} color="purple" />
        <StatCard icon={Award} label="Certificates Issued" value={stats.completedVerifications} color="green" />
        <StatCard icon={AlertTriangle} label="Pending Verifications" value={stats.pendingVerifications} color="amber" />
        <StatCard icon={AlertTriangle} label="Expired Certificates" value={stats.expiredCertificates} color="red" />
        <StatCard icon={UserCheck} label="Active LMOs" value={stats.activeLMOs} color="indigo" />
        <StatCard icon={Building2} label="Active GATCs" value={stats.activeGATCs} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verifications over time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-gray-400" />Verifications Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.verificationsByMonth} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="passed" fill="#22C55E" radius={[4, 4, 0, 0]} name="Passed" stackId="a" />
              <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} name="Failed" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pass/Fail ratio */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Verification Outcomes</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={passFailData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {passFailData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Applications by State */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Applications by State</h2>
        <div className="space-y-2">
          {stats.applicationsByState.map(s => (
            <div key={s.state} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-28">{s.state}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${(s.count / stats.totalApplications) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-800 w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
