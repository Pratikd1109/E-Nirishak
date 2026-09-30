import { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Calendar, Award } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import useAppStore from '../../store/useAppStore.js';
import { getNotifications, markNotificationRead } from '../../data/api.js';

const ICONS = {
  expiry: AlertTriangle, status: Award, schedule: Calendar, assignment: Bell,
};
const COLORS = {
  expiry: 'text-amber-600 bg-amber-50', status: 'text-green-600 bg-green-50',
  schedule: 'text-blue-600 bg-blue-50', assignment: 'text-purple-600 bg-purple-50',
};

export default function Notifications() {
  const { currentUser } = useAppStore();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications(currentUser.id).then(d => { setNotifs(d); setLoading(false); });
  }, [currentUser.id]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{notifs.filter(n => !n.read).length} unread</p>
        </div>
        {notifs.some(n => !n.read) && (
          <button onClick={() => notifs.forEach(n => !n.read && markRead(n.id))} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Bell size={32} className="mx-auto mb-2 opacity-40" /><p>No notifications</p></div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const Icon = ICONS[n.type] || Bell;
            const color = COLORS[n.type] || 'text-gray-600 bg-gray-50';
            return (
              <div key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.read ? 'bg-white border-gray-200' : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-50'}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${color}`}><Icon size={16} /></div>
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
