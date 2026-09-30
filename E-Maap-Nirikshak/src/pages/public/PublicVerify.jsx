import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle, XCircle, AlertCircle, Search, Scale, QrCode,
  ArrowLeft, RefreshCw, Shield, Phone, ChevronRight, ArrowRight
} from 'lucide-react';
import { verifyCertificate } from '../../data/api.js';

const DEMO_IDS = [
  { id: 'CERT-DL-2024-00101', label: '✅ Valid', status: 'Valid' },
  { id: 'CERT-MH-2024-00402', label: '⚠️ Expiring Soon', status: 'Expiring Soon' },
  { id: 'CERT-DL-2023-00102', label: '❌ Expired', status: 'Expired' },
  { id: 'CERT-REVOKED-001',   label: '🚫 Revoked', status: 'Revoked' },
  { id: 'CERT-FAKE-0000',     label: '❓ Not Found', status: 'NOT FOUND' },
];

const STATUS_CONFIG = {
  'Valid':          { icon: CheckCircle, iconColor: 'text-green-600',  bannerBg: 'bg-green-600',  lightBg: 'bg-green-50  border-green-300',  label: 'VALID',          labelBg: 'bg-green-600',  desc: 'This certificate is currently VALID. The instrument is authorised for use in trade and commerce.' },
  'VALID':          { icon: CheckCircle, iconColor: 'text-green-600',  bannerBg: 'bg-green-600',  lightBg: 'bg-green-50  border-green-300',  label: 'VALID',          labelBg: 'bg-green-600',  desc: 'This certificate is currently VALID. The instrument is authorised for use in trade and commerce.' },
  'Expiring Soon':  { icon: AlertCircle, iconColor: 'text-orange-600', bannerBg: 'bg-orange-500', lightBg: 'bg-orange-50 border-orange-300', label: 'EXPIRING SOON', labelBg: 'bg-orange-500', desc: 'Certificate is still valid but will expire shortly. Re-verification must be applied for immediately.' },
  'EXPIRING_SOON':  { icon: AlertCircle, iconColor: 'text-orange-600', bannerBg: 'bg-orange-500', lightBg: 'bg-orange-50 border-orange-300', label: 'EXPIRING SOON', labelBg: 'bg-orange-500', desc: 'Certificate is still valid but will expire shortly. Re-verification must be applied for immediately.' },
  'Expired':        { icon: XCircle,     iconColor: 'text-red-600',    bannerBg: 'bg-red-600',    lightBg: 'bg-red-50   border-red-300',    label: 'EXPIRED',        labelBg: 'bg-red-600',    desc: 'This certificate has EXPIRED. The instrument is NOT authorised for use in trade or commerce.' },
  'EXPIRED':        { icon: XCircle,     iconColor: 'text-red-600',    bannerBg: 'bg-red-600',    lightBg: 'bg-red-50   border-red-300',    label: 'EXPIRED',        labelBg: 'bg-red-600',    desc: 'This certificate has EXPIRED. The instrument is NOT authorised for use in trade or commerce.' },
  'Revoked':        { icon: XCircle,     iconColor: 'text-red-800',    bannerBg: 'bg-red-800',    lightBg: 'bg-red-50   border-red-400',    label: 'REVOKED',        labelBg: 'bg-red-800',    desc: 'This certificate has been REVOKED by the authorities. Do NOT accept this instrument for any transaction.' },
  'REVOKED':        { icon: XCircle,     iconColor: 'text-red-800',    bannerBg: 'bg-red-800',    lightBg: 'bg-red-50   border-red-400',    label: 'REVOKED',        labelBg: 'bg-red-800',    desc: 'This certificate has been REVOKED by the authorities. Do NOT accept this instrument for any transaction.' },
  'NOT FOUND':      { icon: AlertCircle, iconColor: 'text-gray-500',   bannerBg: 'bg-gray-500',   lightBg: 'bg-gray-50  border-gray-300',   label: 'NOT FOUND',      labelBg: 'bg-gray-500',   desc: 'No certificate record found for this ID. It may be invalid, fake, or incorrectly entered.' },
  'NOT_FOUND':      { icon: AlertCircle, iconColor: 'text-gray-500',   bannerBg: 'bg-gray-500',   lightBg: 'bg-gray-50  border-gray-300',   label: 'NOT FOUND',      labelBg: 'bg-gray-500',   desc: 'No certificate record found for this ID. It may be invalid, fake, or incorrectly entered.' },
};

export default function PublicVerify() {
  const { certificateId: paramId } = useParams();
  const navigate = useNavigate();
  const [certId, setCertId]   = useState(paramId || '');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (paramId) doVerify(paramId); }, [paramId]);

  const doVerify = async (id) => {
    const rid = (id ?? certId).trim();
    if (!rid) return;
    setLoading(true); setResult(null);
    const res = await verifyCertificate(rid);
    setResult(res); setLoading(false);
    if (rid !== certId) setCertId(rid);
  };

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG['NOT FOUND']) : null;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">

      {/* ── Tricolour ── */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* ── Official Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="National Emblem"
            className="h-12 w-auto"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="border-l border-gray-300 pl-4">
            <p className="text-[#1a1a6e] font-bold text-sm leading-tight">भारत सरकार &nbsp;|&nbsp; Government of India</p>
            <p className="text-gray-600 text-xs leading-tight">Ministry of Consumer Affairs, Food &amp; Public Distribution</p>
            <p className="text-gray-500 text-[10px] leading-tight">Department of Consumer Affairs — Legal Metrology Division</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1"><Phone size={11} className="text-[#FF9933]" /><span>1800-11-4000</span></div>
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 border border-[#1a3a6e] text-[#1a3a6e] rounded px-3 py-1 text-xs font-semibold hover:bg-[#1a3a6e] hover:text-white transition-colors">
              <ArrowLeft size={11} /> Portal Login
            </button>
          </div>
        </div>
      </div>

      {/* ── Navy Nav ── */}
      <div className="bg-[#1a3a6e]">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-0">
          <div className="flex items-center gap-2 py-2.5 pr-6 border-r border-blue-700 mr-2">
            <Scale size={15} className="text-[#FF9933]" />
            <span className="text-white font-bold text-sm">E-Maap Nirikshak</span>
            <span className="text-blue-300 text-xs">| माप निरीक्षक</span>
          </div>
          {['Home','Portal Login','About','Help'].map(item => (
            <button key={item} onClick={() => item === 'Portal Login' && navigate('/')}
              className="text-xs text-blue-200 hover:text-white hover:bg-[#0f2a5a] px-4 py-2.5 transition-colors font-medium">
              {item}
            </button>
          ))}
          <div className="ml-auto flex items-center py-1.5">
            <span className="text-[10px] bg-[#FF9933] text-white font-bold px-3 py-1 rounded">
              PUBLIC VERIFICATION PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* ── Page Title Band ── */}
      <div className="bg-[#1a3a6e] border-t border-blue-800 pb-4 pt-1">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-[10px] text-blue-300 mb-2">
            <span>Home</span><ChevronRight size={10} /><span>Public Services</span><ChevronRight size={10} /><span className="text-white">Certificate Verification</span>
          </div>
          <h1 className="text-white text-xl font-bold">
            Certificate Verification &nbsp;<span className="text-[#FF9933]">|</span>&nbsp; प्रमाण-पत्र सत्यापन
          </h1>
          <p className="text-blue-200 text-xs mt-0.5">
            Verify the authenticity and validity of Legal Metrology Verification Certificates
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Search + Result — 2/3 */}
        <div className="lg:col-span-2 space-y-4">

          {/* Search box */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#1a3a6e] text-white px-4 py-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FF9933] rounded" />
              <h2 className="font-bold text-sm uppercase tracking-wide">Enter Certificate ID</h2>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4">
                Enter the Certificate Number found on the Legal Metrology Verification Certificate or scan the QR code affixed on the instrument / certificate document.
              </p>
              <div className="flex gap-2">
                <input
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doVerify()}
                  placeholder="e.g. CERT-DL-2024-00101"
                  className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3a6e] focus:ring-1 focus:ring-blue-200 font-mono"
                />
                <button
                  onClick={() => doVerify()}
                  disabled={loading || !certId.trim()}
                  className="flex items-center gap-2 bg-[#1a3a6e] hover:bg-[#0f2a5a] text-white font-bold px-6 py-2.5 rounded text-sm transition-colors disabled:opacity-50"
                >
                  {loading
                    ? <RefreshCw size={15} className="animate-spin" />
                    : <><Search size={15} /> Verify</>
                  }
                </button>
              </div>

              {/* Demo quick picks */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Demo — Try a sample certificate:</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_IDS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setCertId(d.id); doVerify(d.id); }}
                      className="text-[11px] border border-gray-200 text-gray-600 hover:border-[#1a3a6e] hover:text-[#1a3a6e] hover:bg-blue-50 rounded px-3 py-1 transition-colors font-medium"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 text-center">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-[#1a3a6e] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Verifying certificate against government records...</p>
            </div>
          )}

          {/* Result card */}
          {result && cfg && !loading && (
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">

              {/* Status banner */}
              <div className={`${cfg.bannerBg} px-5 py-4 flex items-center gap-4`}>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <cfg.icon size={26} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-2xl font-black tracking-wide">{cfg.label}</span>
                  </div>
                  <p className="text-white/90 text-xs mt-0.5">{cfg.desc}</p>
                </div>
              </div>

              {result.cert ? (
                <div className="p-5 space-y-4">
                  {/* Certificate header */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Certificate Number</p>
                        <p className="font-mono font-bold text-[#1a3a6e] text-base">{result.cert.certificateId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Issued By</p>
                        <p className="text-xs font-semibold text-gray-700">Legal Metrology Dept.</p>
                        <p className="text-[10px] text-gray-500">{result.cert.jurisdiction}</p>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ['Instrument Type', result.cert.instrumentType],
                        ['Manufacturer',    result.cert.manufacturer],
                        ['Model',           result.cert.model],
                        ['Serial Number',   result.cert.serialNumber],
                        ['Capacity',        result.cert.capacity],
                        ['Verified By',     result.cert.verifiedBy],
                        ['Verification Date', result.cert.verificationDate],
                        ['Issue Date',      result.cert.issueDate],
                        ['Valid Until',     result.cert.validUntil],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 border border-gray-100 rounded p-2.5">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{k}</p>
                          <p className="text-xs font-semibold text-gray-800">{v || '—'}</p>
                        </div>
                      ))}
                    </div>

                    {/* Privacy notice */}
                    <div className="px-4 pb-3 flex items-center gap-2 text-[10px] text-gray-400">
                      <Shield size={11} className="text-[#1a3a6e] shrink-0" />
                      Owner identity is withheld from public view in accordance with privacy guidelines.
                    </div>
                  </div>

                  {/* QR section */}
                  <div className="flex items-center gap-6 bg-[#f5f0e8] border border-[#d4a853]/30 rounded-lg p-4">
                    <QRCodeSVG
                      value={`${window.location.origin}${result.cert.qrPayload}`}
                      size={90}
                      level="M"
                      includeMargin
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1a3a6e] mb-1">Certificate QR Code</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed max-w-xs">
                        This QR code is affixed on the instrument or printed on the certificate. Scanning it opens this verification page directly.
                      </p>
                      <p className="text-[10px] text-[#5a3e1b] font-semibold mt-1.5 font-mono">{result.cert.certificateId}</p>
                    </div>
                  </div>

                  {/* Official footer of certificate */}
                  <div className="flex items-start gap-2 text-[10px] text-gray-400 border-t border-gray-100 pt-3">
                    <Scale size={12} className="text-[#1a3a6e] shrink-0 mt-0.5" />
                    Verified via E-Maap Nirikshak — Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India · Legal Metrology Act, 2009
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No record found</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Certificate ID <span className="font-mono font-bold text-gray-600">{certId}</span> does not exist in the system. Please check the ID and try again.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-3">
                    If this instrument has a physical stamp/seal but no digital record, contact the State Legal Metrology Department.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-4">

          {/* How to verify */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#1a3a6e] text-white px-4 py-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FF9933] rounded" />
              <h3 className="font-bold text-sm uppercase tracking-wide">How to Verify</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { step: '1', text: 'Locate the QR code or Certificate Number on the instrument or printed certificate.' },
                { step: '2', text: 'Enter the Certificate ID in the search box or scan the QR code with your phone.' },
                { step: '3', text: 'The portal will show the current status — VALID, EXPIRED, REVOKED, etc.' },
                { step: '4', text: 'If status is VALID, the instrument is legally authorised for trade use.' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1a3a6e] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status guide */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#1a3a6e] text-white px-4 py-2.5 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FF9933] rounded" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Status Guide</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'VALID',          bg: 'bg-green-600',  desc: 'Instrument is authorised for trade use.' },
                { label: 'EXPIRING SOON',  bg: 'bg-orange-500', desc: 'Valid but re-verification needed soon.' },
                { label: 'EXPIRED',        bg: 'bg-red-600',    desc: 'Certificate lapsed — not authorised.' },
                { label: 'REVOKED',        bg: 'bg-red-800',    desc: 'Revoked by authorities — do not accept.' },
                { label: 'NOT FOUND',      bg: 'bg-gray-500',   desc: 'ID invalid or certificate not issued.' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={`${s.bg} text-white text-[9px] font-bold px-2 py-0.5 rounded shrink-0 min-w-24 text-center`}>{s.label}</span>
                  <p className="text-[11px] text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consumer notice */}
          <div className="bg-[#f5f0e8] border border-[#d4a853]/40 rounded-lg p-4">
            <p className="text-[11px] font-bold text-[#5a3e1b] mb-1.5 flex items-center gap-1.5">
              <Shield size={12} className="text-[#d4a853]" /> Consumer Alert
            </p>
            <p className="text-[10px] text-[#7a5e2b] leading-relaxed">
              Under the Legal Metrology Act, 2009, every weighing and measuring instrument used in trade must bear a valid verification certificate. Refuse transactions on instruments showing EXPIRED or REVOKED status.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#5a3e1b] font-semibold">
              <Phone size={10} /> Consumer Helpline: <strong>1800-11-4000</strong>
            </div>
          </div>

          {/* Login CTA */}
          <div className="bg-[#1a3a6e] rounded-lg p-4 text-white">
            <p className="text-sm font-bold mb-1">Are you an Instrument Owner?</p>
            <p className="text-blue-200 text-[11px] mb-3 leading-relaxed">Register instruments, apply for verification and manage certificates online.</p>
            <button onClick={() => navigate('/')}
              className="w-full bg-[#FF9933] hover:bg-[#e8871d] text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition-colors">
              <ArrowRight size={12} /> Login to Portal
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-[#1a3a6e] text-white mt-4">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-blue-300">
          <p>© 2026 E-Maap Nirikshak | Department of Consumer Affairs, Ministry of Consumer Affairs, Food &amp; Public Distribution | Government of India</p>
          <p>SIH 2026 — Vajra Dominators | Problem Statement 26036</p>
        </div>
      </footer>
    </div>
  );
}
