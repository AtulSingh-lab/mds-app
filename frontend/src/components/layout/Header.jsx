import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, FileText, User, LogOut } from 'lucide-react';

export default function Header({ onMenuClick, mobileMenuOpen }) {
  const { user, logout, quota } = useAuth();  // Add quota
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <FileText className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MDS Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Credits Badge */}
            {quota.remaining !== undefined && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                quota.remaining > 3 
                  ? 'bg-green-100 text-green-700'
                  : quota.remaining > 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                🤖 {quota.remaining} / {quota.limit} credits
              </div>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-gray-700">{user?.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User size={14} /> Profile
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}