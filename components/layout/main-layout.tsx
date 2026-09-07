'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'motion/react';
import { User } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-50/50 p-6 selection:bg-blue-100 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-10 text-center space-y-8 z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
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
          
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Acesso Restrito</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/30">
      <Sidebar />
      <main className="flex-1 lg:ml-[88px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen p-4 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
