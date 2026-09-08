'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/use-orders';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  isCurrency?: boolean;
  color?: string;
}

function StatCard({ title, value, icon: Icon, trend, isCurrency, color = "blue" }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    purple: "bg-purple-50 text-purple-600 shadow-purple-100",
    pink: "bg-pink-50 text-pink-600 shadow-pink-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100",
    slate: "bg-slate-50 text-slate-600 shadow-slate-100",
  }[color] || "bg-blue-50 text-blue-600";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white p-6 rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100/60 flex flex-col gap-5 group transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
    >
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110", colorClasses)}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend >= 0 ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
          {isCurrency ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)) : value}
        </h3>
      </div>
    </motion.div>
  );
}

export function DashboardClient() {
  const [period, setPeriod] = useState('last30');
  const [marketplaceFilter, setMarketplaceFilter] = useState('Todos');
  const { orders, loading } = useOrders(period);

  const filteredOrders = useMemo(() => {
    if (marketplaceFilter === 'Todos') return orders;
    return orders.filter(o => o.marketplace === marketplaceFilter);
  }, [orders, marketplaceFilter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.saleValue, 0);
    const totalOrders = filteredOrders.length;
    const totalProductsSold = filteredOrders.reduce((acc, o) => acc + o.quantity, 0);
    const totalMarketplaceFees = filteredOrders.reduce((acc, o) => acc + (o.marketplaceTax + o.otherTaxes + o.subFrete), 0);
    const totalCost = filteredOrders.reduce((acc, o) => acc + o.totalCost, 0);
    const netValue = totalRevenue - totalMarketplaceFees;
    const totalProfit = netValue - totalCost;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProductsSold,
      totalMarketplaceFees,
      totalCost,
      netValue,
      totalProfit,
      margin
    };
  }, [filteredOrders]);

  const dailyChartData = useMemo(() => {
    const daily: Record<string, { date: string, faturamento: number, lucro: number }> = {};
    filteredOrders.forEach(o => {
      const day = format(parseISO(o.date), 'dd/MM');
      if (!daily[day]) {
        daily[day] = { date: day, faturamento: 0, lucro: 0 };
      }
      daily[day].faturamento += o.saleValue;
      daily[day].lucro += o.profit;
    });
    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const marketplaceChartData = useMemo(() => {
    const counts: Record<string, number> = { 'Shopee': 0, 'Mercado Livre': 0 };
    filteredOrders.forEach(o => {
      counts[o.marketplace] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const isDemo = useMemo(() => orders.some(o => o.id?.startsWith('mock')), [orders]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
          <Info size={20} />
          <p className="text-sm font-medium">Você está visualizando <b>dados de demonstração</b>. Cadastre seu primeiro pedido ou importe um CSV para ver seus próprios números.</p>
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 mt-1 font-medium">Sua inteligência financeira centralizada.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="text-[13px] font-bold bg-transparent border-none focus:ring-0 outline-none cursor-pointer text-slate-700"
            >
              <option value="Todos">Todos Marketplaces</option>
              <option value="Shopee">Shopee</option>
              <option value="Mercado Livre">Mercado Livre</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-[13px] font-bold bg-transparent border-none focus:ring-0 outline-none cursor-pointer text-slate-700"
            >
              <option value="today">Hoje</option>
              <option value="last7">Últimos 7 dias</option>
              <option value="last30">Últimos 30 dias</option>
              <option value="thisMonth">Este mês</option>
              <option value="lastMonth">Mês anterior</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Bruto" value={stats.totalRevenue} icon={DollarSign} isCurrency color="blue" />
        <StatCard title="Total de Pedidos" value={stats.totalOrders} icon={ShoppingCart} color="purple" />
        <StatCard title="Produtos Vendidos" value={stats.totalProductsSold} icon={Package} color="pink" />
        <StatCard title="Margem Média" value={stats.margin.toFixed(1) + '%'} icon={Percent} color="emerald" />
        <StatCard title="Taxas Marketplace" value={stats.totalMarketplaceFees} icon={TrendingDown} isCurrency color="amber" />
        <StatCard title="Custo de Produção" value={stats.totalCost} icon={TrendingDown} isCurrency color="rose" />
        <StatCard title="Valor Líquido" value={stats.netValue} icon={DollarSign} isCurrency color="blue" />
        <StatCard title="Lucro Real" value={stats.totalProfit} icon={TrendingUp} isCurrency color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faturamento x Lucro por Dia */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Performance Temporal</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faturamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lucro</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="date" 
                  stroke="#cbd5e1" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  tick={{ fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#cbd5e1" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `R$${v}`} 
                  tick={{ fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '13px' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}
                  formatter={(v: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))}
                />
                <Line 
                  type="monotone" 
                  dataKey="faturamento" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="lucro" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vendas por Marketplace */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60"
        >
          <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Canais de Venda</h3>
          <div className="h-[350px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketplaceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {marketplaceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black text-slate-900 leading-none mt-1">{stats.totalOrders}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {marketplaceChartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[13px] font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-[13px] font-black text-slate-900">{((item.value / stats.totalOrders) * 100 || 0).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Marketplace Comparison Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-8 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Comparativo por Marketplace</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Análise detalhada de performance por canal.</p>
          </div>
        </div>
        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Marketplace</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Volume</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Faturamento</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Taxas</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Repasse</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Lucro Real</th>
                <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Margem %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {['Shopee', 'Mercado Livre'].map(mktp => {
                const mktpOrders = orders.filter(o => o.marketplace === mktp);
                const revenue = mktpOrders.reduce((acc, o) => acc + o.saleValue, 0);
                const profit = mktpOrders.reduce((acc, o) => acc + o.profit, 0);
                const fees = mktpOrders.reduce((acc, o) => acc + (o.marketplaceTax + o.otherTaxes + o.subFrete), 0);
                const net = revenue - fees;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                return (
                  <tr key={mktp} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 font-black text-slate-800 flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        mktp === 'Shopee' ? "bg-orange-500" : "bg-yellow-400"
                      )} />
                      {mktp}
                    </td>
                    <td className="py-6 text-center font-bold text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-[13px]">{mktpOrders.length}</span>
                    </td>
                    <td className="py-6 text-right font-bold text-slate-900 text-[15px]">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-6 text-right font-medium text-rose-500 text-[14px]">R$ {fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-6 text-right font-bold text-blue-600 text-[14px]">R$ {net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-6 text-right font-black text-emerald-600 text-[15px]">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-6 text-center">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl font-black text-[12px] shadow-sm",
                        margin > 20 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
