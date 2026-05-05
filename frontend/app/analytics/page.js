'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { LoadingSpinner, EmptyState, StatsCard } from '@/components/ui';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchAnalytics();
  }, [user, authLoading]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get(`/analytics/${user._id}`);
      setAnalytics(data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const chartTooltipStyle = {
    contentStyle: { background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', color: '#f1f5f9' },
    itemStyle: { color: '#475569' },
  };

  return (
    <div className="min-h-screen page-gradient">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Performance <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-slate-600 mb-8">Track your progress and identify areas for improvement</p>
        </motion.div>

        {loading ? <LoadingSpinner /> : !analytics || analytics.totalTests === 0 ? (
          <EmptyState icon="📊" title="No analytics yet" message="Complete some tests to see your performance analytics." />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatsCard icon="📝" label="Total Tests" value={analytics.totalTests} color="#3b82f6" delay={0} />
              <StatsCard icon="🎯" label="Avg Score" value={`${analytics.avgScore}%`} color="#10b981" delay={0.1} />
              <StatsCard icon="📊" label="Avg Accuracy" value={`${analytics.avgAccuracy}%`} color="#0ea5e9" delay={0.2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Category Performance */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Accuracy by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                    <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} domain={[0, 100]} />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar dataKey="avgAccuracy" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Performance Trend */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Performance Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                    <XAxis dataKey="test" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} domain={[0, 100]} />
                    <Tooltip {...chartTooltipStyle} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Score" />
                    <Line type="monotone" dataKey="accuracy" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} name="Accuracy" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Radar chart for category performance */}
            {analytics.categoryPerformance.length >= 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-card p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Skill Radar
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={analytics.categoryPerformance}>
                    <PolarGrid stroke="rgba(59, 130, 246, 0.2)" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Radar name="Accuracy" dataKey="avgAccuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Radar name="Score" dataKey="avgScore" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} />
                    <Tooltip {...chartTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  💪 Strong Areas
                </h3>
                {analytics.strengths.length === 0 ? (
                  <p className="text-sm text-slate-600">Not enough data yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <span className="text-lg">🌟</span>
                        <span className="text-sm font-medium text-green-400">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  📈 Needs Improvement
                </h3>
                {analytics.weaknesses.length === 0 ? (
                  <p className="text-sm text-slate-600">Not enough data yet</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                        <span className="text-lg">🎯</span>
                        <span className="text-sm font-medium text-yellow-400">{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
