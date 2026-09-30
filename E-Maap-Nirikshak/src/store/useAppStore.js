import { create } from 'zustand';

export const LANGUAGES = [
  { code: 'en',  label: 'English',    native: 'English',     flag: '🇬🇧' },
  { code: 'hi',  label: 'Hindi',      native: 'हिंदी',        flag: '🇮🇳' },
  { code: 'mr',  label: 'Marathi',    native: 'मराठी',        flag: '🟠' },
  { code: 'bn',  label: 'Bengali',    native: 'বাংলা',        flag: '🟡' },
  { code: 'gu',  label: 'Gujarati',   native: 'ગુજરાતી',      flag: '🟢' },
  { code: 'te',  label: 'Telugu',     native: 'తెలుగు',       flag: '🔵' },
  { code: 'ta',  label: 'Tamil',      native: 'தமிழ்',        flag: '🔴' },
  { code: 'kn',  label: 'Kannada',    native: 'ಕನ್ನಡ',         flag: '🟤' },
  { code: 'ml',  label: 'Malayalam',  native: 'മലയാളം',       flag: '🌴' },
  { code: 'pa',  label: 'Punjabi',    native: 'ਪੰਜਾਬੀ',        flag: '🌾' },
  { code: 'ur',  label: 'Urdu',       native: 'اردو',           flag: '☪️' },
  { code: 'or',  label: 'Odia',       native: 'ଓଡ଼ିଆ',         flag: '🔶' },
  { code: 'as',  label: 'Assamese',   native: 'অসমীয়া',       flag: '🌿' },
  { code: 'mai', label: 'Maithili',   native: 'मैथिली',        flag: '🔷' },
  { code: 'kok', label: 'Konkani',    native: 'कोंकणी',         flag: '🐚' },
  { code: 'ne',  label: 'Nepali',     native: 'नेपाली',         flag: '🏔️' },
  { code: 'doi', label: 'Dogri',      native: 'डोगरी',          flag: '🏵️' },
  { code: 'sa',  label: 'Sanskrit',   native: 'संस्कृतम्',      flag: '📜' },
  { code: 'mni', label: 'Manipuri',   native: 'মেইতেই',         flag: '🌸' },
  { code: 'sd',  label: 'Sindhi',     native: 'سنڌي',            flag: '🌊' },
  { code: 'ks',  label: 'Kashmiri',   native: 'کٲشُر',           flag: '❄️' },
  { code: 'sat', label: 'Santali',    native: 'ᱥᱟᱱᱛᱟᱲᱤ',       flag: '🌳' },
  { code: 'bo',  label: 'Bodo',       native: 'बड़ो',            flag: '🎋' },
];

const useAppStore = create((set, get) => ({
  // Auth
  currentUser: null,
  currentRole: null,

  login: (user, role) => set({ currentUser: user, currentRole: role }),
  logout: () => set({ currentUser: null, currentRole: null }),

  // Language
  language: 'en',
  setLanguage: (code) => set({ language: code }),

  // Toast notifications
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export default useAppStore;
