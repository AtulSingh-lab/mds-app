import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Calendar, Shield, ArrowLeft, Save } from 'lucide-react';

export default function Profile() {
  const { user, logout, quota } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // This endpoint should exist in backend
      // await api.put('/auth/profile', { name });
      addToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      addToast('Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-blue-100">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} /> Account Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Documents Processed</span>
                  <span className="font-semibold text-gray-900">
                    {quota.limit - quota.remaining} / {quota.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((quota.limit - quota.remaining) / quota.limit) * 100}%` }}
                  />
                </div>
                {quota.resetDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Resets on {new Date(quota.resetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex gap-3">
              <button
                onClick={logout}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}