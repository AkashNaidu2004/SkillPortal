'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import { SkeletonCard, EmptyState, LoadingSpinner } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { HiClock, HiAcademicCap, HiArrowLeft } from 'react-icons/hi';

export default function TestsByCategoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.categoryId) fetchTests();
  }, [user, authLoading, params.categoryId]);

  const fetchTests = async () => {
    try {
      const { data } = await API.get(`/tests/${params.categoryId}`);
      setTests(data);
    } catch (err) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const categoryName = tests[0]?.categoryId?.name || 'Tests';

  const difficultyColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <HiArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {categoryName}
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : tests.length === 0 ? (
          <EmptyState icon="📝" title="No tests available" message="Tests for this category haven't been created yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tests.map((test, i) => (
              <motion.div key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="glass-card glass-card-hover p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${difficultyColor[test.difficulty]}15`, color: difficultyColor[test.difficulty] }}>
                      {test.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium uppercase"
                      style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#475569' }}>
                      {test.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {test.title}
                  </h3>
                  <p className="text-sm text-slate-600 flex-1 line-clamp-2">{test.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><HiClock className="w-4 h-4" /> {test.duration} min</span>
                    <span className="flex items-center gap-1"><HiAcademicCap className="w-4 h-4" /> {test.questionCount} Qs</span>
                  </div>
                  <Link href={`/test/${test._id}`} className="btn-primary text-center py-2.5 text-sm mt-4 block">
                    Start Test
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
