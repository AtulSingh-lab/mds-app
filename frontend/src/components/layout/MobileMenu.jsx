import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Home, User, LogOut, X } from 'lucide-react';

export default function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Documents', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">Menu</span>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}