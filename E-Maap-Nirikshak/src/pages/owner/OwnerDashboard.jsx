import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, Award, AlertTriangle, Plus, ArrowRight, Clock } from 'lucide-react';
import StatCard from '../../components/shared/StatCard.jsx';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import useAppStore from '../../store/useAppStore.js';
import { useT } from '../../store/i18n.js';
import { getOwnerStats, getApplications, getCertificates, getInstruments } from '../../data/api.js';

export default function OwnerDashboard() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const t = useT();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, apps, certs, instrs] = await Promise.all([
        getOwnerStats(currentUser.id),
        getApplications({ ownerId: currentUser.id }),
        getCertificates({ ownerId: currentUser.id }),
        getInstruments(currentUser.id),
      ]);
      setStats(s);
      setRecentApps(apps.slice(-5).reverse());
      setExpiring(instrs.filter(i => i.status === 'Expiring Soon' || i.status === 'Expired'));
      setLoading(false);
    }
    load();
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}, {currentUser.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('portalSubtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/owner/instruments/register')}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> {t('registerInstrument')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Scale} label={t('totalInstruments')} value={stats.totalInstruments} color="indigo" />
        <StatCard icon={Award} label={t('activeCertificates')} value={stats.activeCertificates} color="green" />
        <StatCard icon={FileText} label={t('pendingApplications')} value={stats.pendingApplications} color="amber" />
        <StatCard icon={AlertTriangle} label={t('expiringSoon')} value={stats.expiringSoon} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('recentApplications')}</h2>
            <button onClick={() => navigate('/owner/applications')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              {t('viewAll')} <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApps.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('noAppsYet')}</p>
            ) : recentApps.map(app => (
              <div key={app.applicationId} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.applicationId}</p>
                  <p className="text-xs text-gray-500">{app.instrumentId} · {app.type}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('expiryAlerts')}</h2>
            <button onClick={() => navigate('/owner/certificates')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              {t('viewCerts')} <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {expiring.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-xs font-semibold border border-green-200">
                  <Award size={14} className="text-green-600" />
                  {t('allCertsValid')}
                </div>
              </div>
            ) : expiring.map(instr => (
              <div key={instr.instrumentId} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg"><Clock size={14} className="text-amber-500" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{instr.type}</p>
                    <p className="text-xs text-gray-500">{instr.instrumentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={instr.status} />
                  {instr.validUntil && <p className="text-xs text-gray-400 mt-1">Until {instr.validUntil}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#6D28D9] rounded-xl p-6 text-white shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('registerInstrument'), route: '/owner/instruments/register', icon: Plus },
            { label: t('applyVerification'), route: '/owner/applications/apply', icon: FileText },
            { label: t('certificates'), route: '/owner/certificates', icon: Award },
            { label: t('myInstruments'), route: '/owner/instruments', icon: Scale },
          ].map(a => (
            <button
              key={a.route}
              onClick={() => navigate(a.route)}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-4 px-3 transition-all"
            >
              <a.icon size={20} />
              <span className="text-xs font-medium text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
