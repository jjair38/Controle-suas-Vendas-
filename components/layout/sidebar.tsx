'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  FileUp, 
  Box, 
  Settings2, 
  TrendingUp, 
  FileText, 
  Settings,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';

const menuGroups = [
  {
    title: 'Início',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    ]
  },
  {
    title: 'Vendas',
    items: [
      { icon: ShoppingBag, label: 'Pedidos', href: '/pedidos' },
      { icon: PlusCircle, label: 'Novo Pedido', href: '/novo-pedido' },
      { icon: FileUp, label: 'Importar CSV', href: '/importar' },
    ]
  },
  {
    title: 'Análise',
    items: [
      { icon: Box, label: 'Produtos', href: '/produtos' },
      { icon: Settings2, label: 'Custos', href: '/custos' },
      { icon: TrendingUp, label: 'Rentabilidade', href: '/rentabilidade' },
      { icon: FileText, label: 'Relatórios', href: '/relatorios' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: Settings, label: 'Configurações', href: '/configuracoes' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const { isOpen, setIsOpen, isMobileOpen, setIsMobileOpen, toggle } = useSidebar();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="fixed top-4 left-4 z-[60] p-2.5 bg-white text-slate-600 rounded-xl shadow-lg border border-slate-100 lg:hidden active:scale-95 transition-transform"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Container */}
      <motion.div 
        animate={{ width: isOpen ? 280 : 88 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200/60 z-50 overflow-hidden flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)]",
          !isMobileOpen && "max-lg:hidden",
          isMobileOpen && "w-[280px] left-0"
        )}
      >
        {/* Header/Logo Section */}
        <div className="p-6 flex items-center gap-4 h-24 shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-100 shrink-0">
            C
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-black text-lg text-slate-900 tracking-tight leading-none uppercase">CRM</span>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1 opacity-80">Financeiro</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items Grouped */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-hide py-2 space-y-8">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <AnimatePresence>
                {isOpen && (
                  <motion.h4 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2"
                  >
                    {group.title}
                  </motion.h4>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      title={!isOpen ? item.label : undefined}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={cn("shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} 
                      />
                      <AnimatePresence mode="wait">
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-[14px] font-bold whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {!isOpen && (
                         <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                         </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer/User Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className={cn(
                "flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300",
                !isOpen && "p-1.5 justify-center"
              )}>
                {user.photoURL ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner shrink-0 border border-slate-100">
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <User size={20} />
                  </div>
                )}
                {isOpen && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-black text-slate-800 truncate leading-none">{user.displayName || 'Usuário'}</span>
                    <span className="text-[10px] font-bold text-slate-400 truncate tracking-tight mt-1">{user.email}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => logout()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 w-full group active:scale-95",
                  !isOpen && "justify-center"
                )}
              >
                <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                {isOpen && <span className="text-[14px] font-bold">Encerrar Sessão</span>}
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 w-full shadow-xl shadow-slate-200 active:scale-95",
                !isOpen && "justify-center"
              )}
            >
              <User size={22} className="shrink-0" />
              {isOpen && <span className="text-[14px] font-black uppercase tracking-wider">Acessar Painel</span>}
            </button>
          )}

          <button 
            onClick={toggle}
            className="hidden lg:flex items-center justify-center w-full py-4 mt-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl transition-all duration-300 active:scale-90"
          >
            <Menu size={20} className={cn("transition-transform duration-500", !isOpen && "rotate-180")} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
