'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import { StatsCard, SkeletonCard, EmptyState } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'admin') { router.push('/admin'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [catRes, resRes] = await Promise.all([
        API.get('/categories'),
        API.get(`/results/${user._id}`),
      ]);
      setCategories(catRes.data);
      setResults(resRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const totalTests = results.length;
  const avgScore = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalTests) : 0;
  const recentResults = results.slice(0, 5);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-slate-600 mt-1">Here&apos;s your learning progress overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon="📝" label="Tests Taken" value={totalTests} color="#3b82f6" delay={0} />
          <StatsCard icon="🎯" label="Avg Score" value={`${avgScore}%`} color="#10b981" delay={0.1} />
          <StatsCard icon="📊" label="Avg Accuracy" value={`${avgAccuracy}%`} color="#0ea5e9" delay={0.2} />
          <StatsCard icon="🏆" label="Categories" value={categories.length} color="#f59e0b" delay={0.3} />
        </div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Assessment Categories
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState icon="📚" title="No categories yet" message="Categories will appear here once an admin creates them." />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <motion.div key={cat._id} variants={item}>
                  <Link href={`/tests/${cat._id}`}>
                    <div className="glass-card glass-card-hover p-6 cursor-pointer">
                      <div className="text-4xl mb-3">{cat.icon || '📝'}</div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{cat.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: '#475569' }}>
                        View Tests <span className="ml-1">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Recent Activity
          </h2>
          {recentResults.length === 0 ? (
            <EmptyState icon="📋" title="No tests taken yet" message="Take your first assessment to see your results here." />
          ) : (
            <div className="space-y-3">
              {recentResults.map((r) => (
                <Link key={r._id} href={`/result/${r._id}`}>
                  <div className="glass-card glass-card-hover p-4 flex items-center justify-between cursor-pointer mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: r.score >= 70 ? 'rgba(16, 185, 129, 0.15)' : r.score >= 40 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                        {r.score >= 70 ? '✅' : r.score >= 40 ? '⚡' : '❌'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{r.testId?.title || 'Test'}</p>
                        <p className="text-xs text-slate-600">
                          {r.testId?.categoryId?.name} · {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{
                        color: r.score >= 70 ? '#10b981' : r.score >= 40 ? '#f59e0b' : '#ef4444',
                        fontFamily: 'Poppins, sans-serif'
                      }}>{r.score}%</p>
                      <p className="text-xs text-slate-600">{r.correctAnswers}/{r.totalQuestions} correct</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
