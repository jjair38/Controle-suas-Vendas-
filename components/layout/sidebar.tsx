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

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingBag, label: 'Pedidos', href: '/pedidos' },
  { icon: PlusCircle, label: 'Novo Pedido', href: '/novo-pedido' },
  { icon: FileUp, label: 'Importar CSV', href: '/importar' },
  { icon: Box, label: 'Produtos', href: '/produtos' },
  { icon: Settings2, label: 'Custos', href: '/custos' },
  { icon: TrendingUp, label: 'Rentabilidade', href: '/rentabilidade' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(true);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Content */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-slate-200/60 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
        isOpen ? "w-[280px]" : "w-[88px]",
        !isMobileOpen && "max-lg:hidden"
      )}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 shrink-0">
            C
          </div>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-slate-900 tracking-tight leading-none">CRM</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Financeiro</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300")} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px] whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                {user.photoURL ? (
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <User size={18} />
                  </div>
                )}
                {isOpen && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-bold text-slate-800 truncate">{user.displayName || 'Usuário'}</span>
                    <span className="text-[10px] font-medium text-slate-400 truncate tracking-tight">{user.email}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => logout()}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 w-full group",
                  !isOpen && "justify-center"
                )}
              >
                <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                {isOpen && <span className="text-[13px] font-semibold">Sair da conta</span>}
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 w-full shadow-lg shadow-slate-200",
                !isOpen && "justify-center"
              )}
            >
              <User size={20} className="shrink-0" />
              {isOpen && <span className="text-[13px] font-bold">Acessar Painel</span>}
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center w-full py-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
