import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Eye, Download, QrCode, X, Award } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getCertificates } from '../../data/api.js';

export default function Certificates() {
  const { currentUser } = useAppStore();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    getCertificates({ ownerId: currentUser.id }).then(d => { setCerts(d); setLoading(false); });
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner text="Loading certificates..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-sm text-gray-500">{certs.length} certificate{certs.length !== 1 ? 's' : ''} across your instruments</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState title="No certificates yet" description="Complete the verification process to receive digital certificates." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map(cert => (
            <CertCard key={cert.certificateId} cert={cert}
              onView={() => setViewModal(cert)}
              onQr={() => setQrModal(cert)}
            />
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <Modal onClose={() => setQrModal(null)} title="Certificate QR Code">
          <div className="flex flex-col items-center gap-4 py-4">
            <QRCodeSVG value={`${window.location.origin}${qrModal.qrPayload}`} size={200} level="M" />
            <div className="text-center">
              <p className="font-mono text-indigo-700 font-bold text-sm">{qrModal.certificateId}</p>
              <p className="text-xs text-gray-500 mt-1">Scan to verify on Public Verification Portal</p>
              <StatusBadge status={qrModal.status} size="lg" />
            </div>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal onClose={() => setViewModal(null)} title="Certificate Details" wide>
          <CertificateView cert={viewModal} />
        </Modal>
      )}
    </div>
  );
}

function CertCard({ cert, onView, onQr }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg"><Award size={16} className="text-purple-600" /></div>
          <div>
            <p className="text-xs font-mono text-indigo-700 font-medium">{cert.certificateId}</p>
            <p className="text-xs text-gray-400">{cert.instrumentType}</p>
          </div>
        </div>
        <StatusBadge status={cert.status} />
      </div>
      <div className="space-y-1.5 text-xs text-gray-600 mb-4">
        <div className="flex justify-between"><span className="text-gray-400">Instrument</span><span className="font-mono text-[10px]">{cert.instrumentId}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Issued</span><span>{cert.issueDate}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Valid Until</span><span className={cert.status === 'Expired' ? 'text-red-600 font-semibold' : 'font-medium'}>{cert.validUntil}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Verified By</span><span className="text-right max-w-40 truncate">{cert.verifiedBy}</span></div>
      </div>
      <div className="flex gap-2 border-t border-gray-100 pt-3">
        <button onClick={onView} className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-gray-200 text-gray-700 rounded-lg py-1.5 hover:bg-gray-50">
          <Eye size={12} /> View
        </button>
        <button onClick={onQr} className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-indigo-200 text-indigo-700 rounded-lg py-1.5 hover:bg-indigo-50">
          <QrCode size={12} /> Show QR
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700">
          <Download size={12} /> Download
        </button>
      </div>
    </div>
  );
}

function CertificateView({ cert }) {
  return (
    <div className="space-y-4">
      {/* Official Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#6D28D9] rounded-xl p-5 text-white text-center">
        <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Government of India</p>
        <p className="text-blue-200 text-xs mb-2">Ministry of Consumer Affairs · Legal Metrology Division</p>
        <h2 className="text-lg font-bold">VERIFICATION CERTIFICATE</h2>
        <p className="font-mono text-blue-200 text-sm mt-1">{cert.certificateId}</p>
        <div className="mt-3"><StatusBadge status={cert.status} size="lg" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          ['Instrument Type', cert.instrumentType],
          ['Manufacturer', cert.manufacturer],
          ['Model', cert.model],
          ['Serial Number', cert.serialNumber],
          ['Capacity', cert.capacity],
          ['Owner', cert.ownerName],
          ['Verification Date', cert.verificationDate],
          ['Issue Date', cert.issueDate],
          ['Valid Until', cert.validUntil],
          ['Verified By', cert.verifiedBy],
        ].map(([k, v]) => (
          <div key={k} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">{k}</p>
            <p className="font-medium text-gray-900 text-sm">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <QRCodeSVG value={`${window.location.origin}${cert.qrPayload}`} size={120} level="M" />
      </div>
    </div>
  );
}

function Modal({ onClose, title, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-sm'} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
