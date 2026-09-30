import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, MapPin, Calendar, Award, FileText, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import { getInstrument, getApplications, getInspections, getCertificates } from '../../data/api.js';

export default function InstrumentPassport() {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [instr, apps, insps, certs] = await Promise.all([
        getInstrument(instrumentId),
        getApplications({ }),
        getInspections({ instrumentId }),
        getCertificates({ instrumentId }),
      ]);
      const instrApps = apps.filter(a => a.instrumentId === instrumentId);
      setData({ instr, apps: instrApps, insps, certs });
      setLoading(false);
    }
    load();
  }, [instrumentId]);

  if (loading) return <LoadingSpinner text="Loading instrument passport..." />;
  if (!data?.instr) return <div className="text-center py-20 text-gray-500">Instrument not found</div>;

  const { instr, apps, insps, certs } = data;
  const latestCert = certs.find(c => c.status === 'Valid') || certs[0];

  // Build timeline
  const timeline = [
    { date: instr.registrationDate, title: 'Instrument Registered', desc: `Registered by owner. Instrument ID: ${instr.instrumentId}`, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    ...apps.map(a => ({ date: a.submittedDate, title: `Application Submitted (${a.type})`, desc: `Application ${a.applicationId} — ${a.status}`, icon: FileText, color: 'text-blue-600 bg-blue-50' })),
    ...insps.map(i => ({ date: i.submittedDate, title: 'Inspection Completed', desc: `Result: ${i.result} · Inspector: ${i.officerId}`, icon: Activity, color: i.result === 'Pass' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50' })),
    ...certs.map(c => ({ date: c.issueDate, title: 'Certificate Issued', desc: `${c.certificateId} · Valid until ${c.validUntil}`, icon: Award, color: 'text-purple-600 bg-purple-50' })),
  ].sort((a, b) => a.date?.localeCompare(b.date ?? '') ?? 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate('/owner/instruments')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Instruments
      </button>

      {/* Passport Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#6D28D9] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">Digital Instrument Passport</p>
            <h1 className="text-2xl font-bold">{instr.type}</h1>
            <p className="text-blue-200 mt-1">{instr.manufacturer} · {instr.model}</p>
            <p className="font-mono text-blue-300 text-sm mt-2">{instr.instrumentId}</p>
          </div>
          <StatusBadge status={instr.status} size="lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/20 text-sm">
          {[
            ['Serial No.', instr.serialNumber],
            ['Capacity', instr.capacity],
            ['Registered', instr.registrationDate],
            ['Valid Until', instr.validUntil || 'Pending'],
          ].map(([k, v]) => (
            <div key={k}><p className="text-blue-300 text-[10px] uppercase">{k}</p><p className="font-semibold">{v}</p></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-gray-400" />Location</h2>
            <p className="text-sm text-gray-700">{instr.registeredAddress}</p>
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl h-28 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl">🗺️</p>
                <p className="text-xs text-blue-600 font-medium mt-1">{instr.lat?.toFixed(4)}, {instr.lng?.toFixed(4)}</p>
              </div>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={16} className="text-gray-400" />Lifecycle Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${t.color}`}>
                      <t.icon size={14} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-900">{t.title}</p>
                        <span className="text-[10px] text-gray-400 ml-2 shrink-0">{t.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate + QR */}
        <div className="space-y-4">
          {latestCert ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Award size={16} className="text-gray-400" />Current Certificate</h2>
              <StatusBadge status={latestCert.status} size="lg" />
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Cert ID</span><span className="font-mono text-indigo-700 font-medium text-[10px]">{latestCert.certificateId}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Issued</span><span>{latestCert.issueDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Valid Until</span><span className="font-medium">{latestCert.validUntil}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Verified By</span><span className="text-right max-w-28 truncate">{latestCert.verifiedBy}</span></div>
              </div>
              {/* QR Code */}
              <div className="mt-4 flex flex-col items-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <QRCodeSVG value={`${window.location.origin}${latestCert.qrPayload}`} size={110} level="M" />
                <p className="text-[9px] text-gray-400 mt-2 text-center">Scan to verify certificate</p>
              </div>
              <button
                onClick={() => navigate(`/owner/certificates`)}
                className="w-full mt-3 text-xs border border-indigo-200 text-indigo-700 rounded-lg py-2 hover:bg-indigo-50 transition-colors"
              >View Certificate</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="text-center py-4">
                <Clock size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No Certificate Yet</p>
                <p className="text-xs text-gray-400 mt-1">Submit a verification application to receive a certificate</p>
                <button
                  onClick={() => navigate('/owner/applications/apply', { state: { instrumentId: instr.instrumentId } })}
                  className="mt-3 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >Apply for Verification</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Applications</span><span className="font-semibold">{apps.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Inspections</span><span className="font-semibold">{insps.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Certificates</span><span className="font-semibold">{certs.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
