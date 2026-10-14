'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { LotusIcon } from '@/components/SacredMotif';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@amrita.edu');
  const [password, setPassword] = useState('AmritaDarshanam@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('amrita_admin_token', data.token);
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#6E1B24] p-2 mx-auto flex items-center justify-center border border-[#D4AF37] shadow-sm">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#6E1B24]">
            Administrator Sign In
          </h1>
          <p className="text-xs text-stone-500 font-serif italic">
            Department of Amrita Darshanam • Editorial Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@amrita.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6E1B24] hover:bg-[#8C2B36] text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development & Project Testing Credentials Notice */}
        <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-[11px] text-stone-600 space-y-1">
          <span className="font-semibold text-amber-900 block font-mono uppercase">
            Default Project Credentials:
          </span>
          <p>Email: <span className="font-mono text-stone-800">admin@amrita.edu</span></p>
          <p>Password: <span className="font-mono text-stone-800">AmritaDarshanam@2026</span></p>
        </div>
      </div>
    </div>
  );
}
