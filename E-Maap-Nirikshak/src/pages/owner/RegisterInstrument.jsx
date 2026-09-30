import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';
import { registerInstrument } from '../../data/api.js';

const INSTRUMENT_TYPES = [
  'Platform Scale', 'Counter Scale', 'Weighbridge', 'Fuel Dispenser',
  'Retail Scale', 'Taxi Meter', 'Spring Balance', 'Analytical Balance',
  'Belt Weigher', 'Hopper Scale', 'Water Meter', 'Electricity Meter',
];
const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

const STEPS = ['Instrument Type', 'Technical Details', 'Location & Address', 'Review & Submit'];

export default function RegisterInstrument() {
  const { currentUser, addToast } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    type: '', manufacturer: '', model: '', serialNumber: '',
    capacity: '', ownerId: currentUser.id,
    registeredAddress: currentUser.address || '',
    lat: 28.6139, lng: 77.2090,
    state: currentUser.state || '', city: currentUser.city || '',
    pincode: currentUser.pincode || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = [
    form.type,
    form.manufacturer && form.model && form.serialNumber && form.capacity,
    form.registeredAddress && form.state && form.city,
    true,
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await registerInstrument(form);
    setLoading(false);
    setDone(true);
    addToast('Instrument registered successfully!', 'success');
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Instrument Registered</h2>
          <p className="text-gray-500 text-sm mb-6">Your {form.type} has been registered successfully. You can now submit a verification application.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/owner/instruments')} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">My Instruments</button>
            <button onClick={() => navigate('/owner/applications/apply')} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm hover:bg-indigo-700">Apply for Verification</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register New Instrument</h1>
        <p className="text-sm text-gray-500 mt-1">Register a weighing or measuring instrument for legal metrology verification</p>
      </div>

      {/* Progress */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-indigo-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step ? 'bg-indigo-600 border-indigo-600 text-white' : i === step ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {step === 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Select Instrument Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INSTRUMENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${form.type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Technical Details</h2>
            {[
              { label: 'Manufacturer', key: 'manufacturer', placeholder: 'e.g. Mettler Toledo, Essae Teraoka' },
              { label: 'Model', key: 'model', placeholder: 'e.g. DS-852, BC-60' },
              { label: 'Serial Number', key: 'serialNumber', placeholder: 'As printed on the instrument' },
              { label: 'Capacity / Range', key: 'capacity', placeholder: 'e.g. 150 kg, 999 L, 80 Tonne' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-gray-600 block mb-1">{f.label} *</label>
                <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Location & Address</h2>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Full Address *</label>
              <textarea value={form.registeredAddress} onChange={e => set('registeredAddress', e.target.value)}
                rows={3} placeholder="Shop/Unit number, Street, Area"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Pincode</label>
                <input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6-digit PIN"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">State *</label>
              <select value={form.state} onChange={e => set('state', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option value="">Select State</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Map Pin Placeholder */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
              <div className="h-40 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                <div className="text-center">
                  <div className="text-3xl mb-1">📍</div>
                  <p className="text-xs text-blue-700 font-medium">Map Pin Placement</p>
                  <p className="text-[10px] text-blue-500 mt-0.5">Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)}</p>
                  <button
                    onClick={() => set('lat', form.lat + (Math.random()-0.5)*0.001)}
                    className="mt-2 text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
                  >Simulate Pin Drop</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Review & Confirm</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                ['Instrument Type', form.type],
                ['Manufacturer', form.manufacturer],
                ['Model', form.model],
                ['Serial Number', form.serialNumber],
                ['Capacity / Range', form.capacity],
                ['Address', form.registeredAddress],
                ['City', form.city],
                ['State', form.state],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 text-sm">
                  <span className="text-gray-500 w-36 shrink-0">{k}</span>
                  <span className="text-gray-900 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              By submitting, you confirm that the above information is accurate and that this instrument will be used in lawful trade/commerce as per the Legal Metrology Act, 2009.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => step === 0 ? navigate('/owner/instruments') : setStep(s => s - 1)}
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!valid[step]}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-40">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60">
            {loading ? 'Registering...' : 'Submit Registration'}
          </button>
        )}
      </div>
    </div>
  );
}
