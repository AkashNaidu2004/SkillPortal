'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { StatsCard, LoadingSpinner } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ categories: 0, tests: 0, questions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user?.role !== 'admin') { router.push('/dashboard'); return; }
    if (user?.role === 'admin') fetchStats();
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      const [catRes, testRes] = await Promise.all([
        API.get('/categories'),
        API.get('/admin/tests'),
      ]);
      setStats({
        categories: catRes.data.length,
        tests: testRes.data.length,
        questions: testRes.data.reduce((s, t) => s + (t.questionCount || 0), 0),
      });
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-600 mb-8">Manage categories, tests, and questions</p>
        </motion.div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <StatsCard icon="📂" label="Categories" value={stats.categories} color="#3b82f6" delay={0} />
              <StatsCard icon="📝" label="Tests" value={stats.tests} color="#0ea5e9" delay={0.1} />
              <StatsCard icon="❓" label="Questions" value={stats.questions} color="#10b981" delay={0.2} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { href: '/admin/categories', icon: '📂', title: 'Manage Categories', desc: 'Add, edit, or remove assessment categories', color: '#3b82f6' },
                { href: '/admin/tests', icon: '📝', title: 'Manage Tests', desc: 'Create and configure tests within categories', color: '#0ea5e9' },
                { href: '/admin/questions', icon: '❓', title: 'Manage Questions', desc: 'Add MCQ and coding questions to tests', color: '#10b981' },
              ].map((card, i) => (
                <motion.a key={card.href} href={card.href}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-card glass-card-hover p-6 block cursor-pointer">
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.desc}</p>
                  <div className="mt-4 text-sm font-medium" style={{ color: card.color }}>
                    Open →
                  </div>
                </motion.a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
