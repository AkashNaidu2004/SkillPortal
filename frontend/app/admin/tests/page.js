'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiClock } from 'react-icons/hi';

export default function AdminTests() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', categoryId: '', duration: 30, type: 'mcq', difficulty: 'medium', description: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
    if (user?.role === 'admin') fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([API.get('/admin/tests'), API.get('/categories')]);
      setTests(tRes.data); setCategories(cRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/admin/test/${editing}`, form);
        toast.success('Test updated');
      } else {
        await API.post('/admin/test', form);
        toast.success('Test created');
      }
      setShowModal(false); setEditing(null);
      setForm({ title: '', categoryId: '', duration: 30, type: 'mcq', difficulty: 'medium', description: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this test and all its questions?')) return;
    try { await API.delete(`/admin/test/${id}`); toast.success('Test deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (t) => {
    setForm({ title: t.title, categoryId: t.categoryId?._id || t.categoryId, duration: t.duration, type: t.type, difficulty: t.difficulty, description: t.description || '' });
    setEditing(t._id); setShowModal(true);
  };

  if (authLoading || !user) return null;
  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Manage Tests</h1>
          <button onClick={() => { setEditing(null); setForm({ title: '', categoryId: categories[0]?._id || '', duration: 30, type: 'mcq', difficulty: 'medium', description: '' }); setShowModal(true); }}
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5">
            <HiPlus className="w-4 h-4" /> Add Test
          </button>
        </div>

        {loading ? <LoadingSpinner /> : tests.length === 0 ? (
          <EmptyState icon="📝" title="No tests" message="Create your first test." />
        ) : (
          <div className="space-y-3">
            {tests.map((t, i) => (
              <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-card p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{t.title}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ background: `${diffColor[t.difficulty]}15`, color: diffColor[t.difficulty] }}>{t.difficulty}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium uppercase" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#475569' }}>{t.type}</span>
                  </div>
                  <p className="text-sm text-slate-600 flex items-center gap-3">
                    <span>{t.categoryId?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{t.duration}m</span>
                    <span>{t.questionCount || 0} questions</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"><HiPencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10"><HiTrash className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="glass-card p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{editing ? 'Edit Test' : 'New Test'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900"><HiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Title</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Category</label>
                      <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="input-field" required>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Duration (min)</label>
                      <input type="number" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})} className="input-field" min={5} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Type</label>
                      <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                        <option value="mcq">MCQ</option>
                        <option value="coding">Coding</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Difficulty</label>
                      <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="input-field">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} />
                  </div>
                  <button type="submit" className="btn-primary w-full py-2.5 text-sm">{editing ? 'Update' : 'Create'}</button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
