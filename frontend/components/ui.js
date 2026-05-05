'use client';

import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-4 w-3/4 mb-3" />
      <div className="skeleton h-3 w-1/2 mb-4" />
      <div className="skeleton h-10 w-full" />
    </div>
  );
}

export function StatsCard({ icon, label, value, color = '#3b82f6', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card glass-card-hover p-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${color}20` }}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold" style={{ color, fontFamily: 'Poppins, sans-serif' }}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', message = 'Data will appear here once available.' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-12 text-center"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
      <p className="text-slate-600">{message}</p>
    </motion.div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
        style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-12 text-center"
    >
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">Error</h3>
      <p className="text-slate-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary px-6 py-2.5">
          Try Again
        </button>
      )}
    </motion.div>
  );
}
