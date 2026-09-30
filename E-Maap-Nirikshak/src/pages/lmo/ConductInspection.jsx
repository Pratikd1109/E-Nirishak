import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Camera, MapPin, Plus, Trash2, AlertTriangle, Navigation, Package, ExternalLink, Compass } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ShopLocationViewer from '../../components/shared/ShopLocationViewer.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getApplication, getInstrument, getOwners, submitInspection } from '../../data/api.js';

const CHECKLIST_ITEMS = [
  { key: 'physicalCondition', label: 'Physical Condition', desc: 'Check for damage, corrosion, or physical defects' },
  { key: 'serialNumber', label: 'Serial Number Match', desc: 'Verify serial number matches registration records' },
  { key: 'sealCondition', label: 'Seal Condition', desc: 'Check integrity of legal metrology seals/stamps' },
  { key: 'zeroError', label: 'Zero Error', desc: 'Check that instrument reads zero when unloaded' },
  { key: 'accuracyTest', label: 'Accuracy Test', desc: 'Test accuracy with reference weights/measures' },
  { key: 'capacity', label: 'Capacity Test', desc: 'Verify instrument performance at rated capacity' },
  { key: 'measurementTest', label: 'Measurement Test', desc: 'Verify measurement accuracy across range' },
  { key: 'displayReading', label: 'Display/Reading', desc: 'Check legibility and correctness of display' },
  { key: 'otherChecks', label: 'Other Checks', desc: 'Any additional checks required by regulation' },
];

const RESULT_OPTIONS = ['Pass', 'Fail', 'Needs Review'];

export default function ConductInspection() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser, addToast } = useAppStore();

  const [app, setApp] = useState(null);
  const [instr, setInstr] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const [checklist, setChecklist] = useState({});
  const [checklistRemarks, setChecklistRemarks] = useState({});
  const [measurements, setMeasurements] = useState([{ expected: '', observed: '', error: '', unit: 'kg' }]);
  const [photos, setPhotos] = useState([]);
  const [gps, setGps] = useState(null);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [finalResult, setFinalResult] = useState('');
  const [overallRemarks, setOverallRemarks] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    async function load() {
      const a = await getApplication(applicationId);
      if (!a) { setLoading(false); return; }
      const [i, owners] = await Promise.all([getInstrument(a.instrumentId), getOwners()]);
      const o = owners.find(ow => ow.id === i?.ownerId);
      setApp(a); setInstr(i); setOwner(o); setLoading(false);
    }
    load();
  }, [applicationId]);

  const setCheckItem = (key, val) => setChecklist(c => ({ ...c, [key]: val }));
  const setCheckRemark = (key, val) => setChecklistRemarks(c => ({ ...c, [key]: val }));

  const addMeasurement = () => setMeasurements(m => [...m, { expected: '', observed: '', error: '', unit: 'kg' }]);
  const removeMeasurement = (i) => setMeasurements(m => m.filter((_, idx) => idx !== i));
  const updateMeasurement = (i, k, v) => setMeasurements(m => m.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const autoCalcError = (i, field, value) => {
    const updated = { ...measurements[i], [field]: value };
    if (field === 'observed' || field === 'expected') {
      const diff = parseFloat(updated.observed) - parseFloat(updated.expected);
      if (!isNaN(diff)) updated.error = (diff >= 0 ? '+' : '') + diff.toFixed(3);
    }
    setMeasurements(m => m.map((r, idx) => idx === i ? updated : r));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(p => [...p, { name: file.name, url: ev.target.result }]);
      reader.readAsDataURL(file);
    });
  };

  const simulateGPS = () => {
    // Simulated GPS: slightly offset from instrument location
    const mockLat = (instr?.lat || 28.6139) + (Math.random() - 0.5) * 0.001;
    const mockLng = (instr?.lng || 77.2090) + (Math.random() - 0.5) * 0.001;
    const deltaM = Math.round(Math.sqrt(
      Math.pow((mockLat - (instr?.lat || 28.6139)) * 111320, 2) +
      Math.pow((mockLng - (instr?.lng || 77.2090)) * 111320 * Math.cos(mockLat * Math.PI / 180), 2)
    ));
    setGps({ lat: mockLat, lng: mockLng, delta: deltaM });
    setGpsCaptured(true);
  };

  const checklistComplete = CHECKLIST_ITEMS.every(item => checklist[item.key]);
  const onSiteVerified = gpsCaptured && (gps?.delta <= 200);
  const canSubmit = checklistComplete && finalResult && onSiteVerified;

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitInspection({
      applicationId,
      officerId: currentUser.id,
      officerType: currentUser.role,
      instrumentId: app.instrumentId,
      checklistResults: checklist,
      checklistRemarks,
      measurements: measurements.filter(m => m.expected && m.observed),
      evidencePhotos: photos.map(p => p.name),
      gpsLat: gps?.lat,
      gpsLng: gps?.lng,
      gpsDeltaMeters: gps?.delta,
      result: finalResult,
      remarks: overallRemarks,
    });
    setSubmitting(false);
    setDone(result);
    addToast(
      result.certificateId
        ? `Inspection complete! Certificate ${result.certificateId} issued.`
        : 'Inspection submitted.',
      result.certificateId ? 'success' : 'warning'
    );
  };

  if (loading) return <LoadingSpinner text="Loading inspection..." />;
  if (!app) return <div className="text-center py-20 text-gray-500">Application not found</div>;

  if (done) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Inspection Submitted</h2>
          <p className="text-gray-500 text-sm mb-2">Result: <span className={`font-bold ${finalResult === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{finalResult}</span></p>
          {done.certificateId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-green-700">Certificate auto-generated:</p>
              <p className="font-mono text-green-800 font-bold text-sm">{done.certificateId}</p>
            </div>
          )}
          <button onClick={() => navigate('/lmo/assignments')} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700">Back to Assignments</button>
        </div>
      </div>
    );
  }

  const sections = ['overview', 'checklist', 'measurements', 'evidence', 'gps', 'result'];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conduct Inspection</h1>
          <p className="text-sm text-gray-500">{app.instrumentId} · {applicationId}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize ${activeSection === s ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >{s === 'gps' ? 'GPS Verify' : s}</button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package size={16} className="text-gray-400" />Instrument Details</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Type', instr?.type], ['Manufacturer', instr?.manufacturer],
                ['Model', instr?.model], ['Serial Number', instr?.serialNumber],
                ['Capacity', instr?.capacity], ['Status', instr?.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{k === 'Status' ? <StatusBadge status={v} /> : v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Owner & Location</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Owner', owner?.name], ['Phone', owner?.phone],
                ['City', owner?.city], ['State', owner?.state],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Shop &amp; Inspection Site Location</span>
                  <p className="text-xs text-gray-800 font-medium leading-snug">{app?.shopAddress || instr?.registeredAddress}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                <span className="font-mono text-[10px] text-blue-700 font-semibold">
                  📍 {(app?.shopLocation?.lat || instr?.lat)?.toFixed(6)}, {(app?.shopLocation?.lng || instr?.lng)?.toFixed(6)}
                </span>
                <a
                  href={app?.shopLocation?.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${instr?.lat || 28.6562},${instr?.lng || 77.2310}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  <Compass size={11} />
                  <span>Google Maps Directions</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
          {instr?.lastVerified && (
            <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">Previous Verification</p>
              <p className="text-xs text-amber-700">Last verified: {instr.lastVerified} · Valid until: {instr.validUntil}</p>
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      {activeSection === 'checklist' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Inspection Checklist</h2>
            <span className="text-xs text-gray-500">{Object.keys(checklist).length}/{CHECKLIST_ITEMS.length} completed</span>
          </div>
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map(item => (
              <div key={item.key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  {checklist[item.key] && <StatusBadge status={checklist[item.key]} />}
                </div>
                <div className="flex gap-2 mt-2">
                  {['Pass', 'Fail', 'Needs Review'].map(opt => (
                    <button key={opt} onClick={() => setCheckItem(item.key, opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        checklist[item.key] === opt
                          ? opt === 'Pass' ? 'bg-green-600 text-white border-green-600'
                            : opt === 'Fail' ? 'bg-red-600 text-white border-red-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >{opt}</button>
                  ))}
                </div>
                <input
                  value={checklistRemarks[item.key] || ''}
                  onChange={e => setCheckRemark(item.key, e.target.value)}
                  placeholder="Remark (optional)"
                  className="w-full mt-2 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-300"
                />
              </div>
            ))}
          </div>
          {!checklistComplete && (
            <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">Complete all checklist items before proceeding.</p>
            </div>
          )}
        </div>
      )}

      {/* Measurements */}
      {activeSection === 'measurements' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Measurement Records</h2>
            <button onClick={addMeasurement} className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
              <Plus size={12} /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs">
                  <th className="text-left px-3 py-2 text-gray-600 font-semibold">#</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-semibold">Expected Value</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-semibold">Observed Value</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-semibold">Error</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-semibold">Unit</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {measurements.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                    {['expected', 'observed'].map(field => (
                      <td key={field} className="px-2 py-2">
                        <input value={row[field]} onChange={e => autoCalcError(i, field, e.target.value)}
                          placeholder="0.00" type="number" step="0.001"
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-300"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <span className={`text-sm font-mono font-medium ${row.error?.startsWith('+') ? 'text-green-600' : row.error?.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                        {row.error || '—'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <select value={row.unit} onChange={e => updateMeasurement(i, 'unit', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none bg-white"
                      >
                        {['kg','g','mg','L','mL','m','cm','mm','T'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      {measurements.length > 1 && (
                        <button onClick={() => removeMeasurement(i)} className="text-red-400 hover:text-red-600 p-1 rounded">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">Overall Remarks</label>
            <textarea value={overallRemarks} onChange={e => setOverallRemarks(e.target.value)}
              rows={3} placeholder="Technical observations, special conditions, etc."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-300 resize-none"
            />
          </div>
        </div>
      )}

      {/* Evidence */}
      {activeSection === 'evidence' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Evidence & Photographs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {photos.map((p, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setPhotos(ph => ph.filter((_, idx) => idx !== i))} className="p-2 bg-red-600 rounded-full text-white">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[9px] text-white truncate">{p.name}</p>
                </div>
              </div>
            ))}
            <button onClick={() => fileInputRef.current.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Camera size={24} />
              <span className="text-xs">Add Photo</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">Required evidence:</p>
            {['Instrument photograph (front view)', 'Serial number/plate photograph', 'Seal condition photograph', 'Measurement/testing evidence'].map(e => (
              <div key={e} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${photos.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                  {photos.length > 0 ? '✓' : '○'}
                </div>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GPS On-Site Verification with Leaflet Map & Anti-Corruption Geo-Check */}
      {activeSection === 'gps' && (
        <div className="space-y-4">
          <ShopLocationViewer
            shopLocation={
              app?.shopLocation || {
                lat: instr?.lat || 28.6562,
                lng: instr?.lng || 77.2310,
                mapsUrl: `https://www.google.com/maps?q=${instr?.lat || 28.6562},${instr?.lng || 77.2310}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${instr?.lat || 28.6562},${instr?.lng || 77.2310}`,
              }
            }
            shopAddress={app?.shopAddress || instr?.registeredAddress || owner?.address}
            isLmo={true}
            onVerificationChange={(info) => {
              setGps({
                lat: info.officerLat,
                lng: info.officerLng,
                delta: info.distanceMeters,
                verified: info.verified,
              });
              setGpsCaptured(true);
            }}
          />
        </div>
      )}

      {/* Final Result */}
      {activeSection === 'result' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Final Verification Result</h2>

          {/* Progress check */}
          <div className="space-y-2">
            {[
              { label: 'Verification checklist completed', done: checklistComplete },
              { label: 'On-site GPS presence verified (within 200m)', done: gpsCaptured && (gps?.delta <= 200) },
              { label: 'Final decision result selected', done: !!finalResult },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-2 text-sm ${item.done ? 'text-green-700' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  {item.done ? '✓' : '○'}
                </div>
                {item.label}
              </div>
            ))}
          </div>

          {/* Anti-Corruption Warning when distance exceeds 200m */}
          {gpsCaptured && gps?.delta > 200 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Anti-Corruption Violation: Distance Mismatch ({gps.delta}m away)</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Officer GPS is located outside the 200m radius of the shop premises. To prevent fraudulent, unverified, or remote inspection submissions, confirmation of physical on-site presence is strictly mandatory.
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select Result *</p>
            <div className="grid grid-cols-3 gap-3">
              {RESULT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setFinalResult(opt)}
                  className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    finalResult === opt
                      ? opt === 'Pass' ? 'bg-green-600 border-green-600 text-white'
                        : opt === 'Fail' ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-amber-500 border-amber-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >{opt}</button>
              ))}
            </div>
          </div>

          {finalResult === 'Pass' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <CheckCircle size={16} className="inline mr-2" />
              Submitting as <strong>PASS</strong> will automatically generate a digital verification certificate for this instrument.
            </div>
          )}
          {finalResult === 'Fail' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              <AlertTriangle size={16} className="inline mr-2" />
              Submitting as <strong>FAIL</strong> will mark the application as rejected. The owner will be notified.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Inspection Result'}
          </button>
        </div>
      )}
    </div>
  );
}
