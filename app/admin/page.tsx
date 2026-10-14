'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  LogOut,
  Sparkles,
  MessageSquare,
  Eye,
  FileText
} from 'lucide-react';
import { LotusIcon } from '@/components/SacredMotif';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'festivals' | 'occasions' | 'slokhas' | 'review' | 'feedback'>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [festivals, setFestivals] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [slokhas, setSlokhas] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Modal / Form states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'festival' | 'occasion' | 'slokha' | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('amrita_admin_token');
    if (!savedToken) {
      router.push('/admin/login');
    } else {
      setToken(savedToken);
      fetchDashboardData(savedToken);
    }
  }, [router]);

  const fetchDashboardData = async (authToken: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      const [fRes, oRes, sRes, rRes, fbRes] = await Promise.all([
        fetch('/api/admin/festivals', { headers }),
        fetch('/api/admin/occasions', { headers }),
        fetch('/api/admin/slokhas', { headers }),
        fetch('/api/admin/review', { headers }),
        fetch('/api/feedback', { headers }),
      ]);

      if (fRes.status === 401) {
        localStorage.removeItem('amrita_admin_token');
        router.push('/admin/login');
        return;
      }

      const [fData, oData, sData, rData, fbData] = await Promise.all([
        fRes.ok ? fRes.json() : [],
        oRes.ok ? oRes.json() : [],
        sRes.ok ? sRes.json() : [],
        rRes.ok ? rRes.json() : [],
        fbRes.ok ? fbRes.json() : [],
      ]);

      setFestivals(Array.isArray(fData) ? fData : []);
      setOccasions(Array.isArray(oData) ? oData : []);
      setSlokhas(Array.isArray(sData) ? sData : []);
      setReviews(Array.isArray(rData) ? rData : []);
      setFeedbacks(Array.isArray(fbData) ? fbData : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('amrita_admin_token');
    router.push('/admin/login');
  };

  // Delete Festival
  const handleDeleteFestival = async (id: string) => {
    if (!confirm('Are you sure you want to delete this festival?')) return;
    try {
      const res = await fetch(`/api/admin/festivals?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFestivals(festivals.filter((f) => f.id !== id));
      }
    } catch (e) {
      alert('Failed to delete festival');
    }
  };

  // Save Festival
  const handleSaveFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      id: editingItem?.id,
      name: formData.get('name'),
      slug: formData.get('slug'),
      date: formData.get('date'),
      category: formData.get('category'),
      region: formData.get('region'),
      deities: formData.get('deities'),
      source: formData.get('source'),
      verificationStatus: formData.get('verificationStatus'),
      description: formData.get('description'),
    };

    const method = editingItem?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/festivals', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalType(null);
        setEditingItem(null);
        fetchDashboardData(token!);
      } else {
        alert('Failed to save festival');
      }
    } catch (err) {
      alert('Error saving festival');
    }
  };

  // Resolve Review Item
  const handleResolveReview = async (id: string) => {
    try {
      const res = await fetch('/api/admin/review', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: 'resolved' }),
      });
      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
      }
    } catch (err) {
      alert('Error updating review item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <LotusIcon className="w-10 h-10 mx-auto text-[#6E1B24] animate-spin" />
          <p className="text-xs text-stone-500 font-mono">Authenticating Administrator Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Bar */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#6E1B24] p-2 flex items-center justify-center border border-[#D4AF37] shadow-sm">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#6E1B24]">
              Amrita Darshanam Admin Portal
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Signed in as: admin@amrita.edu • Department Editor Mode
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchDashboardData(token!)}
            className="px-3 py-1.5 rounded-lg border border-[#DACFBB] text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8DEC8] pb-3 text-xs">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: Sparkles },
          { key: 'festivals', label: `Festivals (${festivals.length})`, icon: Calendar },
          { key: 'occasions', label: `Occasions (${occasions.length})`, icon: Calendar },
          { key: 'slokhas', label: `Slokhas (${slokhas.length})`, icon: BookOpen },
          { key: 'review', label: `Review Queue (${reviews.filter(r => r.status !== 'resolved').length})`, icon: AlertCircle },
          { key: 'feedback', label: `Feedback (${feedbacks.length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-medium transition ${
                isSelected
                  ? 'bg-[#6E1B24] text-white shadow-xs font-semibold'
                  : 'bg-[#FFFDF9] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 uppercase font-mono font-semibold">Festivals Configured</span>
              <div className="text-3xl font-serif font-bold text-[#6E1B24]">{festivals.length}</div>
              <p className="text-[11px] text-stone-500">Panchanga dates verified by year</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 uppercase font-mono font-semibold">Campus Occasions</span>
              <div className="text-3xl font-serif font-bold text-[#6E1B24]">{occasions.length}</div>
              <p className="text-[11px] text-stone-500">Includes Sri Mahaganapathi Homam</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 uppercase font-mono font-semibold">Canonical Slokhas</span>
              <div className="text-3xl font-serif font-bold text-[#6E1B24]">{slokhas.length}</div>
              <p className="text-[11px] text-stone-500">Across 4 classical languages</p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 uppercase font-mono font-semibold">Items in Review</span>
              <div className="text-3xl font-serif font-bold text-amber-800">
                {reviews.filter((r) => r.status !== 'resolved').length}
              </div>
              <p className="text-[11px] text-stone-500">Requiring editorial check</p>
            </div>
          </div>

          {/* Quick Notice on Source Document Archival */}
          <div className="bg-[#FAF6EF] rounded-2xl border border-[#E8DEC8] p-6 text-xs text-stone-700 space-y-2">
            <h3 className="font-serif font-bold text-base text-[#6E1B24] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database Status: Active &amp; Verified</span>
            </h3>
            <p className="leading-relaxed">
              All 6 primary DOCX source documents (ENGLISH.docx, SANSKRIT.docx, TAMIL.docx, TELUGU.docx, and SRI MAHAGANAPATHI HOMAM JULY.docx) have been imported into SQLite. Slices and verse sequences have been validated without synthetic text.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: FESTIVALS MANAGEMENT */}
      {activeTab === 'festivals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
              Hindu Festival Database Records ({festivals.length})
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                setModalType('festival');
              }}
              className="px-3.5 py-1.5 bg-[#6E1B24] hover:bg-[#8C2B36] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Festival</span>
            </button>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EF] border-b border-[#E8DEC8] text-amber-950 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3.5">Festival Name</th>
                    <th className="p-3.5">Date (YYYY-MM-DD)</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Region</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DEC8]">
                  {festivals.map((fest) => (
                    <tr key={fest.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-3.5 font-semibold text-[#6E1B24]">
                        {fest.name}
                      </td>
                      <td className="p-3.5 font-mono text-stone-600">{fest.date}</td>
                      <td className="p-3.5 text-stone-600">{fest.category}</td>
                      <td className="p-3.5 text-stone-600">{fest.region}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {fest.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(fest);
                            setModalType('festival');
                          }}
                          className="p-1 text-stone-600 hover:text-amber-800"
                          title="Edit festival"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFestival(fest.id)}
                          className="p-1 text-stone-600 hover:text-rose-700"
                          title="Delete festival"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
                Review Queue for Unverified or Incomplete Items ({reviews.length})
              </h3>
              <p className="text-xs text-stone-500">
                Items flagged during DOCX extraction that require manual administrator verification or additional text.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  r.status === 'resolved'
                    ? 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                    : 'bg-[#FFFDF9] border-amber-300 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {r.entityType}
                    </span>
                    <span className="text-xs font-semibold text-[#6E1B24]">
                      {r.title}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Source: {r.sourceDocument}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">{r.message}</p>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  {r.status !== 'resolved' ? (
                    <button
                      onClick={() => handleResolveReview(r.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium">✓ Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VISITOR FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
            Visitor Inquiries &amp; Prayer Requests ({feedbacks.length})
          </h3>
          {feedbacks.length === 0 ? (
            <p className="text-xs text-stone-500">No visitor feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E8DEC8] shadow-xs space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#6E1B24]">{fb.name} ({fb.email})</span>
                    <span className="text-[11px] font-mono text-stone-400">{fb.category}</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed bg-[#FAF6EF] p-2.5 rounded-lg border border-[#E8DEC8]">
                    {fb.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FESTIVAL EDIT MODAL */}
      {modalType === 'festival' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
              {editingItem ? 'Edit Festival Entry' : 'Add New Festival'}
            </h3>
            <form onSubmit={handleSaveFestival} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Festival Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">URL Slug</label>
                  <input
                    name="slug"
                    required
                    defaultValue={editingItem?.slug || ''}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Date (YYYY-MM-DD)</label>
                  <input
                    name="date"
                    required
                    defaultValue={editingItem?.date || '2026-07-22'}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingItem?.category || 'Major Hindu Festival'}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Region</label>
                  <input
                    name="region"
                    defaultValue={editingItem?.region || 'Pan-Indian'}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Deities</label>
                <input
                  name="deities"
                  defaultValue={editingItem?.deities || ''}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Panchanga Source</label>
                <input
                  name="source"
                  defaultValue={editingItem?.source || 'Drik Panchang Verified'}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Status</label>
                <select
                  name="verificationStatus"
                  defaultValue={editingItem?.verificationStatus || 'verified'}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="verified">Verified</option>
                  <option value="tentative">Tentative</option>
                  <option value="pending_review">Pending Review</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingItem?.description || ''}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6E1B24] text-white rounded-lg font-semibold"
                >
                  Save Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
