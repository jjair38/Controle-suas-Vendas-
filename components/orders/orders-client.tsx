'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/use-orders';
import { useProducts } from '@/hooks/use-data';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Download, 
  Plus,
  ArrowUpDown,
  MoreVertical,
  ShoppingBag,
  Circle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Marketplace, Order } from '@/lib/types';
import Link from 'next/link';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function OrdersClient() {
  const { orders, loading } = useOrders('all'); // Assuming 'all' or default
  const [searchTerm, setSearchTerm] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('Todos');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order, direction: 'asc' | 'desc' } | null>(null);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchTerm) {
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (marketplaceFilter !== 'Todos') {
      result = result.filter(o => o.marketplace === marketplaceFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, searchTerm, marketplaceFilter, sortConfig]);

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (error) {
        console.error("Erro ao excluir pedido:", error);
      }
    }
  };

  const getProfitColor = (margin: number) => {
    if (margin < 0) return "text-red-600 bg-red-50";
    if (margin < 15) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  if (loading) return <div>Carregando pedidos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pedidos</h1>
          <p className="text-slate-500 mt-1 font-medium">Controle total sobre suas vendas e margens de lucro.</p>
        </div>
        <Link 
          href="/novo-pedido"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 group active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Registrar Venda
        </Link>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100/60 flex flex-col md:flex-row gap-4 items-center bg-slate-50/30">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por ID ou Produto..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/60 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <select 
                className="w-full md:w-auto pl-10 pr-10 py-3 bg-white border border-slate-200/60 rounded-[20px] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-[13px] font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                value={marketplaceFilter}
                onChange={(e) => setMarketplaceFilter(e.target.value)}
              >
                <option value="Todos">Todos Canais</option>
                <option value="Shopee">Shopee</option>
                <option value="Mercado Livre">Mercado Livre</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <button onClick={() => handleSort('marketplace')} className="flex items-center gap-1.5 hover:text-slate-600 transition-colors group">
                    Marketplace <ArrowUpDown size={12} className="group-hover:scale-125 transition-transform" />
                  </button>
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <button onClick={() => handleSort('date')} className="flex items-center gap-1.5 hover:text-slate-600 transition-colors group">
                    Data <ArrowUpDown size={12} className="group-hover:scale-125 transition-transform" />
                  </button>
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">ID Pedido</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Produto</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Qtd</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Repasse</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Lucro</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Margem</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm",
                      order.marketplace === 'Shopee' ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    )}>
                      {order.marketplace}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-[13px] font-bold text-slate-400 whitespace-nowrap">
                    {format(parseISO(order.date), 'dd MMM, yy', { locale: ptBR })}
                  </td>
                  <td className="px-6 py-6 text-[13px] font-black text-slate-900 tracking-tight">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-6 text-[13px] font-bold text-slate-600 max-w-[180px] truncate">
                    {order.product}
                  </td>
                  <td className="px-6 py-6 text-[13px] font-black text-slate-400 text-center">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">{order.quantity}</span>
                  </td>
                  <td className="px-6 py-6 text-[14px] font-bold text-blue-600 text-right">
                    R$ {order.netValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className={cn("px-3 py-1.5 rounded-xl text-[13px] font-black shadow-sm", getProfitColor(order.margin))}>
                      R$ {order.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={cn("text-[13px] font-black", order.margin < 0 ? "text-red-500" : order.margin < 15 ? "text-amber-500" : "text-emerald-500")}>
                      {order.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-1.5 mx-auto w-fit shadow-sm border",
                      order.status === 'Concluído' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                      order.status === 'Cancelado' ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      <Circle size={6} fill="currentColor" />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id!)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-200">
                        <ShoppingBag size={32} />
                      </div>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Nenhum pedido encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
