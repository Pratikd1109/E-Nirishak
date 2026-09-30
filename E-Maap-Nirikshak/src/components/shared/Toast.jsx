import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
    error: <XCircle size={18} className="text-red-500 shrink-0" />,
    warning: <AlertCircle size={18} className="text-amber-500 shrink-0" />,
    info: <AlertCircle size={18} className="text-blue-500 shrink-0" />,
  };
  const borders = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
  };
  return (
    <div className={`flex items-start gap-3 bg-white rounded-lg shadow-lg border border-gray-200 border-l-4 ${borders[toast.type] ?? borders.info} px-4 py-3 min-w-72 max-w-sm animate-in slide-in-from-right`}>
      {icons[toast.type]}
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  );
}
