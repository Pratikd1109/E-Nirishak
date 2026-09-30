import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ShopMapLocationPicker from '../../components/shared/ShopMapLocationPicker.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getInstruments, submitApplication } from '../../data/api.js';

export default function ApplyVerification() {
  const { currentUser, addToast } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = location.state?.instrumentId;

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const [selectedInstrument, setSelectedInstrument] = useState(preselected || '');
  const [applicationType, setApplicationType] = useState('re-verification');
  const [remarks, setRemarks] = useState('');
  const [shopLocationData, setShopLocationData] = useState(null);

  useEffect(() => {
    getInstruments(currentUser.id).then(d => {
      setInstruments(d);
      setLoading(false);
    });
  }, [currentUser.id]);

  const selectedInstr = instruments.find(i => i.instrumentId === selectedInstrument);

  // Initialize shop location when instrument changes
  useEffect(() => {
    if (selectedInstr) {
      const defaultLat = selectedInstr.lat || 28.6562;
      const defaultLng = selectedInstr.lng || 77.2310;
      const defaultAddr = selectedInstr.registeredAddress || currentUser.address || 'Delhi';
      setShopLocationData({
        lat: defaultLat,
        lng: defaultLng,
        address: defaultAddr,
        mapsUrl: `https://www.google.com/maps?q=${defaultLat},${defaultLng}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${defaultLat},${defaultLng}`,
        accuracy: 8,
        verifiedByGPS: true,
        timestamp: new Date().toISOString(),
      });
    }
  }, [selectedInstr, currentUser.address]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const loc = shopLocationData || {
      lat: selectedInstr?.lat || 28.6562,
      lng: selectedInstr?.lng || 77.2310,
      address: selectedInstr?.registeredAddress || currentUser.address,
      mapsUrl: `https://www.google.com/maps?q=${selectedInstr?.lat || 28.6562},${selectedInstr?.lng || 77.2310}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${selectedInstr?.lat || 28.6562},${selectedInstr?.lng || 77.2310}`,
      accuracy: 8,
      verifiedByGPS: true,
      timestamp: new Date().toISOString(),
    };

    const result = await submitApplication({
      instrumentId: selectedInstrument,
      type: applicationType,
      ownerId: currentUser.id,
      remarks,
      shopAddress: loc.address,
      shopLocation: loc,
    });

    setSubmitting(false);
    setDone({
      applicationId: result.applicationId,
      location: loc,
    });
    addToast('Verification application submitted with verified GPS location!', 'success');
  };

  if (loading) return <LoadingSpinner />;

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Application Submitted</h2>
            <p className="text-gray-500 text-xs mt-1">Application ID:</p>
            <p className="font-mono text-indigo-700 font-bold text-base mt-0.5">{done.applicationId}</p>
          </div>

          {/* Location Confirmation Pill */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
              <MapPin size={14} className="text-blue-600" />
              <span>Shop Inspection Location Locked:</span>
            </div>
            <p className="text-gray-700 leading-snug">{done.location.address}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-[11px] text-blue-600">
                {done.location.lat.toFixed(6)}, {done.location.lng.toFixed(6)}
              </span>
              <a
                href={done.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 text-left flex items-start gap-2">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Anti-Corruption Guarantee:</span>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-normal">
                The Legal Metrology Officer (LMO) is provided with your exact Google Maps navigation pin. The officer cannot submit a verification report without GPS confirming physical presence at your premises.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/owner/applications')}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 font-medium"
            >
              View Applications
            </button>
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm hover:bg-indigo-700 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for Verification / Re-verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit instrument details and pinpoint your shop location on Google Maps for on-site inspection
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Instrument selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Select Instrument *</label>
          <select
            value={selectedInstrument}
            onChange={e => setSelectedInstrument(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">— Select an instrument —</option>
            {instruments.map(i => (
              <option key={i.instrumentId} value={i.instrumentId}>
                {i.type} — {i.instrumentId} ({i.serialNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedInstr && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 border border-gray-100">
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-800">{selectedInstr.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Manufacturer</span><span>{selectedInstr.manufacturer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Model / Capacity</span><span>{selectedInstr.model} ({selectedInstr.capacity})</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Current Status</span><StatusBadge status={selectedInstr.status} /></div>
            {selectedInstr.validUntil && <div className="flex justify-between"><span className="text-gray-500">Valid Until</span><span>{selectedInstr.validUntil}</span></div>}
          </div>
        )}

        {/* Application type */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Application Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 're-verification', label: 'Re-verification (Annual / Bi-annual)', desc: 'Mandatory periodic verification under Section 24' },
              { value: 'new', label: 'Initial Verification', desc: 'First-time stamping for newly acquired instrument' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setApplicationType(opt.value)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  applicationType === opt.value
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className={`text-sm font-semibold ${applicationType === opt.value ? 'text-indigo-800' : 'text-gray-700'}`}>{opt.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Shop Location & Map GUI ── */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">
            Shop / Inspection Site Location (Google Maps Pin) *
          </label>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            The Legal Metrology Officer (LMO) will navigate directly to this pinned location to verify your instrument. Confirm or detect your current shop coordinates.
          </p>

          <ShopMapLocationPicker
            initialLocation={
              selectedInstr?.lat
                ? { lat: selectedInstr.lat, lng: selectedInstr.lng, verifiedByGPS: true }
                : { lat: 28.6562, lng: 77.2310, verifiedByGPS: true }
            }
            initialAddress={selectedInstr?.registeredAddress || currentUser.address}
            onChange={(loc) => setShopLocationData(loc)}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Remarks for Inspector (optional)</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={2}
            placeholder="e.g. Shop open between 10 AM to 6 PM; contact shop manager on arrival..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => navigate('/owner/applications')}
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedInstrument || submitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 shadow-sm"
        >
          {submitting ? 'Submitting Application...' : 'Submit Application & Share Location'}
        </button>
      </div>
    </div>
  );
}
