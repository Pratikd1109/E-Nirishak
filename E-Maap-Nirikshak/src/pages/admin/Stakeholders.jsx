import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2 } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import { getOwners, getLMOs, getGATCs } from '../../data/api.js';

export default function Stakeholders() {
  const [tab, setTab] = useState('owners');
  const [owners, setOwners] = useState([]);
  const [lmos, setLmos] = useState([]);
  const [gatcs, setGatcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOwners(), getLMOs(), getGATCs()]).then(([o, l, g]) => {
      setOwners(o); setLmos(l); setGatcs(g); setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Loading stakeholders..." />;

  const TABS = [
    { key: 'owners', label: 'Instrument Owners', icon: Users, count: owners.length },
    { key: 'lmos', label: 'Legal Metrology Officers', icon: UserCheck, count: lmos.length },
    { key: 'gatcs', label: 'GATCs', icon: Building2, count: gatcs.length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stakeholder Management</h1>
        <p className="text-sm text-gray-500">Registered users, officers and test centres</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === t.key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <t.icon size={14} />{t.label} <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'owners' && (
        <StakeholderTable
          data={owners}
          columns={['Name','Email','Phone','City','State','Registered']}
          rows={o => [o.name, o.email, o.phone, o.city, o.state, o.registeredDate]}
        />
      )}
      {tab === 'lmos' && (
        <StakeholderTable
          data={lmos}
          columns={['Name','Email','Phone','Designation','Jurisdiction','Inspections']}
          rows={l => [l.name, l.email, l.phone, l.designation, l.jurisdiction, `${l.completedInspections} completed`]}
        />
      )}
      {tab === 'gatcs' && (
        <StakeholderTable
          data={gatcs}
          columns={['Name','Email','Phone','Accreditation','Jurisdiction','Tests']}
          rows={g => [g.name, g.email, g.phone, g.accreditation, g.jurisdiction, `${g.completedTests} completed`]}
        />
      )}
    </div>
  );
}

function StakeholderTable({ data, columns, rows }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
            ))}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {rows(item).map((val, j) => (
                <td key={j} className={`px-4 py-3 text-gray-700 ${j === 0 ? 'font-semibold' : ''}`}>{val}</td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <button className="text-xs border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-50">View</button>
                  <button className="text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-50">Deactivate</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
