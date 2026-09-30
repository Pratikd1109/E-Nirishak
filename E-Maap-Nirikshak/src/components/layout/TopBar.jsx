import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Scale, LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore, { LANGUAGES } from '../../store/useAppStore.js';
import { useT } from '../../store/i18n.js';

const ROLE_META = {
  owner: { roleKey: 'roleOwner', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  lmo:   { roleKey: 'roleLmo',   badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  gatc:  { roleKey: 'roleGatc',  badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  admin: { roleKey: 'roleAdmin', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
};

function LanguageSwitcher() {
  const { language, setLanguage } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 border border-gray-200 hover:border-[#1a3a6e] hover:bg-blue-50 rounded px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-[#1a3a6e] transition-colors"
        title="Change Language"
      >
        <span className="text-xs">{current.flag || '🌐'}</span>
        <span>{current.native}</span>
        <ChevronDown
          size={11}
          className={`text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Language</p>
            <span className="text-[10px] text-indigo-600 font-semibold">{LANGUAGES.length} Indian Languages</span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50 hover:text-[#1a3a6e]
                  ${language === lang.code ? 'bg-blue-50 text-[#1a3a6e] font-semibold' : 'text-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <div>
                    <div className="leading-tight font-medium">{lang.native}</div>
                    {lang.native !== lang.label && (
                      <div className="text-[10px] text-gray-400 leading-none mt-0.5">{lang.label}</div>
                    )}
                  </div>
                </div>
                {language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a3a6e] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ role }) {
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();
  const t = useT();
  const meta = ROLE_META[role] || {};

  const notifRoute = role === 'owner' ? '/owner/notifications' : null;

  return (
    <header className="bg-white border-b border-gray-200 shrink-0 sticky top-0 z-20 shadow-sm">
      {/* ── Tricolour micro strip ── */}
      <div className="flex h-0.5">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="h-12 flex items-center justify-between px-5">
        {/* Left — breadcrumb / ministry name */}
        <div className="flex items-center gap-2">
          <Scale size={15} className="text-[#1a3a6e]" />
          <div className="hidden sm:block">
            <p className="text-[10px] text-gray-400 leading-none">{t('ministryName')}</p>
            <p className="text-xs font-semibold text-[#1a3a6e] leading-none mt-0.5">{t('portalHeader')}</p>
          </div>
        </div>

        {/* Right — language switcher, role badge, notif, user */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Role badge */}
          <span className={`hidden sm:inline-flex text-[10px] font-semibold border rounded px-2 py-0.5 ${meta.badge}`}>
            {t(meta.roleKey || 'roleOwner')}
          </span>

          {/* Notification bell */}
          <button
            onClick={() => notifRoute && navigate(notifRoute)}
            className="relative p-1.5 rounded hover:bg-gray-100 transition-colors"
            title={t('notifications')}
          >
            <Bell size={16} className="text-gray-500" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* User */}
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <div className="w-7 h-7 rounded bg-[#1a3a6e] text-white text-[10px] font-bold flex items-center justify-center">
              {currentUser?.avatar || currentUser?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-none">{currentUser?.name}</p>
              <p className="text-[9px] text-gray-400 leading-none mt-0.5">
                {currentUser?.designation || currentUser?.city || 'Portal User'}
              </p>
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </div>

          {/* Quick logout */}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors ml-1"
            title={t('logout')}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
