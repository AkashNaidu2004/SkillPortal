'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

export default function AdminCategories() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📝' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
    if (user?.role === 'admin') fetchCategories();
  }, [user, authLoading]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/admin/category/${editing}`, form);
        toast.success('Category updated');
      } else {
        await API.post('/admin/category', form);
        toast.success('Category created');
      }
      setShowModal(false); setEditing(null); setForm({ name: '', description: '', icon: '📝' });
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await API.delete(`/admin/category/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description, icon: cat.icon });
    setEditing(cat._id); setShowModal(true);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Manage Categories</h1>
          <button onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '📝' }); setShowModal(true); }}
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5">
            <HiPlus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {loading ? <LoadingSpinner /> : categories.length === 0 ? (
          <EmptyState icon="📂" title="No categories" message="Create your first assessment category." />
        ) : (
          <div className="space-y-3">
            {categories.map((cat, i) => (
              <motion.div key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                    <p className="text-sm text-slate-600">{cat.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"><HiPencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10"><HiTrash className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="glass-card p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {editing ? 'Edit Category' : 'New Category'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900"><HiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Icon (emoji)</label>
                    <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} />
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
