import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import { getCertificates } from '../../data/api.js';

export default function CertificateRegistry() {
  const [certs, setCerts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewCert, setViewCert] = useState(null);

  useEffect(() => {
    getCertificates().then(d => { setCerts(d); setFiltered(d); setLoading(false); });
  }, []);

  useEffect(() => {
    let f = certs;
    if (statusFilter !== 'All') f = f.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(c =>
        c.certificateId.toLowerCase().includes(q) ||
        c.instrumentId.toLowerCase().includes(q) ||
        c.ownerName?.toLowerCase().includes(q) ||
        c.serialNumber?.toLowerCase().includes(q)
      );
    }
    setFiltered(f);
  }, [search, statusFilter, certs]);

  if (loading) return <LoadingSpinner text="Loading certificates..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Registry</h1>
        <p className="text-sm text-gray-500">{certs.length} total certificates issued</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by Certificate ID, Instrument ID, Owner..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2">
          {['All','Valid','Expiring Soon','Expired','Revoked'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Certificate ID','Instrument','Type','Owner','Issue Date','Valid Until','Status','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(cert => (
              <tr key={cert.certificateId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-medium">{cert.certificateId}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{cert.instrumentId}</td>
                <td className="px-4 py-3 text-xs">{cert.instrumentType}</td>
                <td className="px-4 py-3 text-xs font-medium">{cert.ownerName}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{cert.issueDate}</td>
                <td className="px-4 py-3 text-xs font-medium">{cert.validUntil}</td>
                <td className="px-4 py-3"><StatusBadge status={cert.status} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setViewCert(cert)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No certificates match your search</div>
        )}
      </div>

      {/* View Modal */}
      {viewCert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Certificate Details</h3>
              <button onClick={() => setViewCert(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#6D28D9] rounded-xl p-4 text-white text-center">
                <p className="text-blue-200 text-xs">VERIFICATION CERTIFICATE</p>
                <p className="font-mono text-sm font-bold mt-1">{viewCert.certificateId}</p>
                <div className="mt-2"><StatusBadge status={viewCert.status} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Instrument Type', viewCert.instrumentType],
                  ['Manufacturer', viewCert.manufacturer],
                  ['Model', viewCert.model],
                  ['Serial Number', viewCert.serialNumber],
                  ['Owner', viewCert.ownerName],
                  ['Verified By', viewCert.verifiedBy],
                  ['Issue Date', viewCert.issueDate],
                  ['Valid Until', viewCert.validUntil],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                    <p className="font-medium text-xs">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <QRCodeSVG value={`${window.location.origin}${viewCert.qrPayload}`} size={120} level="M" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
