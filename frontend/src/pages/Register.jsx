import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';  // ✅ fixed path

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-xl shadow-lg mt-20">
      <h2 className="text-3xl font-extrabold mb-2 text-gray-900 text-center">Create an Account</h2>
      <p className="text-gray-500 text-center mb-8">Start simplifying your documents today.</p>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" required placeholder="John Doe"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name} onChange={e => setName(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" required placeholder="you@example.com"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email} onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" required placeholder="••••••••"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password} onChange={e => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md">
          Sign Up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Log in here</Link>
      </p>
    </div>
  );
}