import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    warning: <AlertCircle size={18} className="text-yellow-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-white rounded-lg shadow-lg border-l-4 border-current p-3 min-w-[280px] animate-slide-in">
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-sm text-gray-700">{message}</span>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </div>
  );
}