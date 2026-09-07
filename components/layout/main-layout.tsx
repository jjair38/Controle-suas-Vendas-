'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useAuth();
  const { isOpen } = useSidebar();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-50/50 p-6 selection:bg-blue-100 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-10 text-center space-y-8 z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Painel de Controle</h1>
            <p className="text-slate-500 font-medium leading-relaxed px-4">Gerencie sua produção, vendas e lucratividade com precisão matemática.</p>
          </div>
          <button
            onClick={() => login()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group active:scale-[0.98]"
          >
            Acessar com Google
            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <User size={14} />
            </div>
          </button>
          
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Acesso Restrito</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <motion.main 
        animate={{ 
          marginLeft: isOpen ? 280 : 88,
          transition: { type: 'spring', damping: 25, stiffness: 200 }
        }}
        className="flex-1 min-h-screen p-4 lg:p-10 max-lg:!ml-0"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="content-wrapper"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
