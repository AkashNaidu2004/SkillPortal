'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiHome, HiChartBar, HiCog, HiLogout, HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const navItems = isAdmin
    ? [
        { href: '/admin', label: 'Dashboard', icon: HiHome },
        { href: '/admin/categories', label: 'Categories', icon: HiCog },
        { href: '/admin/tests', label: 'Tests', icon: HiCog },
        { href: '/admin/questions', label: 'Questions', icon: HiCog },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: HiHome },
        { href: '/analytics', label: 'Analytics', icon: HiChartBar },
      ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
              SP
            </div>
            <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="gradient-text">SkillPortal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
                  }`}
                  style={isActive ? { background: 'rgba(59, 130, 246, 0.2)', color: '#475569' } : {}}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-xs capitalize" style={{ color: '#475569' }}>{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Logout"
            >
              <HiLogout className="w-5 h-5" />
            </button>
            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900"
            >
              {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t px-4 py-3"
          style={{ borderColor: 'rgba(59, 130, 246, 0.15)', background: 'rgba(255, 255, 255, 0.95)' }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-all"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
