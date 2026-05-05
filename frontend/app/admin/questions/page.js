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

export default function AdminQuestions() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    testId: '', type: 'mcq', questionText: '', difficulty: 'medium',
    options: ['', '', '', ''], correctAnswer: '',
    constraints: '', sampleInput: '', sampleOutput: '',
    testCases: [{ input: '', expectedOutput: '' }],
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/login'); return; }
    if (user?.role === 'admin') fetchTests();
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedTest) fetchQuestions(selectedTest);
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const { data } = await API.get('/admin/tests');
      setTests(data);
      if (data.length > 0) setSelectedTest(data[0]._id);
    } catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  };

  const fetchQuestions = async (testId) => {
    try {
      const { data } = await API.get(`/admin/questions/${testId}`);
      setQuestions(data);
    } catch { toast.error('Failed to load questions'); }
  };

  const resetForm = () => setForm({
    testId: selectedTest, type: 'mcq', questionText: '', difficulty: 'medium',
    options: ['', '', '', ''], correctAnswer: '',
    constraints: '', sampleInput: '', sampleOutput: '',
    testCases: [{ input: '', expectedOutput: '' }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, testId: form.testId || selectedTest };
    if (payload.type === 'mcq') {
      delete payload.constraints; delete payload.sampleInput; delete payload.sampleOutput; delete payload.testCases;
    } else {
      delete payload.options; delete payload.correctAnswer;
    }
    try {
      if (editing) {
        await API.put(`/admin/question/${editing}`, payload);
        toast.success('Question updated');
      } else {
        await API.post('/admin/question', payload);
        toast.success('Question created');
      }
      setShowModal(false); setEditing(null); resetForm();
      fetchQuestions(selectedTest);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await API.delete(`/admin/question/${id}`); toast.success('Question deleted'); fetchQuestions(selectedTest); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (q) => {
    setForm({
      testId: q.testId, type: q.type, questionText: q.questionText, difficulty: q.difficulty,
      options: q.options?.length ? q.options : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      constraints: q.constraints || '', sampleInput: q.sampleInput || '', sampleOutput: q.sampleOutput || '',
      testCases: q.testCases?.length ? q.testCases : [{ input: '', expectedOutput: '' }],
    });
    setEditing(q._id); setShowModal(true);
  };

  const addTestCase = () => setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '' }] });
  const removeTestCase = (i) => setForm({ ...form, testCases: form.testCases.filter((_, idx) => idx !== i) });
  const updateTestCase = (i, field, val) => {
    const tc = [...form.testCases]; tc[i][field] = val; setForm({ ...form, testCases: tc });
  };
  const updateOption = (i, val) => {
    const opts = [...form.options]; opts[i] = val; setForm({ ...form, options: opts });
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Manage Questions</h1>
          <button onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
            className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5">
            <HiPlus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Test selector */}
        <div className="mb-6">
          <label className="block text-sm text-slate-600 mb-1.5">Select Test</label>
          <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)} className="input-field max-w-md">
            {tests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.categoryId?.name})</option>)}
          </select>
        </div>

        {loading ? <LoadingSpinner /> : questions.length === 0 ? (
          <EmptyState icon="❓" title="No questions" message="Add questions to this test." />
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} className="glass-card p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">Q{i + 1}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium uppercase"
                      style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#475569' }}>{q.type}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{ background: q.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.15)' : q.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: q.difficulty === 'hard' ? '#ef4444' : q.difficulty === 'medium' ? '#f59e0b' : '#10b981' }}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 truncate">{q.questionText}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(q)} className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"><HiPencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q._id)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10"><HiTrash className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="glass-card p-6 w-full max-w-xl my-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {editing ? 'Edit Question' : 'New Question'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900"><HiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Type</label>
                      <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                        <option value="mcq">MCQ</option>
                        <option value="coding">Coding</option>
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
                    <label className="block text-sm text-slate-600 mb-1">Question Text</label>
                    <textarea value={form.questionText} onChange={e => setForm({...form, questionText: e.target.value})}
                      className="input-field" rows={3} required />
                  </div>

                  {form.type === 'mcq' && (
                    <>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Options</label>
                        <div className="space-y-2">
                          {form.options.map((opt, i) => (
                            <input key={i} value={opt} onChange={e => updateOption(i, e.target.value)}
                              className="input-field" placeholder={`Option ${String.fromCharCode(65 + i)}`} required />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Correct Answer</label>
                        <select value={form.correctAnswer} onChange={e => setForm({...form, correctAnswer: e.target.value})} className="input-field" required>
                          <option value="">Select correct option...</option>
                          {form.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {form.type === 'coding' && (
                    <>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Constraints</label>
                        <input value={form.constraints} onChange={e => setForm({...form, constraints: e.target.value})} className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Sample Input</label>
                          <input value={form.sampleInput} onChange={e => setForm({...form, sampleInput: e.target.value})} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Sample Output</label>
                          <input value={form.sampleOutput} onChange={e => setForm({...form, sampleOutput: e.target.value})} className="input-field" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm text-slate-600">Test Cases</label>
                          <button type="button" onClick={addTestCase} className="text-xs font-medium" style={{ color: '#475569' }}>+ Add</button>
                        </div>
                        <div className="space-y-2">
                          {form.testCases.map((tc, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)}
                                className="input-field flex-1" placeholder="Input" />
                              <input value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                                className="input-field flex-1" placeholder="Expected Output" />
                              {form.testCases.length > 1 && (
                                <button type="button" onClick={() => removeTestCase(i)} className="text-red-400 hover:text-red-300 shrink-0">
                                  <HiX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

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
