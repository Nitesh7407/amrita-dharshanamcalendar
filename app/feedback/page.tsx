'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { LotusIcon, SacredDivider } from '@/components/SacredMotif';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', category: 'general', message: '' });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to submit feedback.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#6E1B24] p-2 mx-auto flex items-center justify-center border border-[#D4AF37] shadow-sm">
          <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24]">
          Contact &amp; Feedback
        </h1>
        <p className="text-sm text-stone-600 max-w-xl mx-auto font-serif italic">
          Help us preserve and enhance the Amrita Dharma Calendar. Submit suggestions, prayer requests, or date corrections to the Department of Amrita Darshanam.
        </p>
      </div>

      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm">
        {status === 'success' ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
            <h3 className="font-serif font-bold text-xl text-[#6E1B24]">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Your message has been recorded and submitted to the Department of Amrita Darshanam editorial team.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 px-5 py-2 bg-[#6E1B24] hover:bg-[#8C2B36] text-white text-xs font-semibold rounded-xl transition"
            >
              Submit Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Your Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. anand@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Feedback Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-sm text-stone-800 focus:outline-none"
              >
                <option value="general">General Feedback / Suggestion</option>
                <option value="festival_date">Festival Date / Panchanga Correction</option>
                <option value="correction">Slokha Text / Script Correction</option>
                <option value="prayer_request">Request Missing Slokha or Language Version</option>
                <option value="amrita_event">Amrita Campus Spiritual Event Notice</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Detailed Message <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share your feedback, correction details, or prayer suggestions with specific references..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 bg-[#6E1B24] hover:bg-[#8C2B36] text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-200" />
              <span>{status === 'submitting' ? 'Submitting...' : 'Send Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
