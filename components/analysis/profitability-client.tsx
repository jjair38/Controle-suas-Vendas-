'use client';

import React, { useMemo } from 'react';
import { useOrders } from '@/hooks/use-orders';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  AlertCircle,
  Trophy,
  Activity,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function ProfitabilityClient() {
  const { orders, loading } = useOrders('last30');

  const productStats = useMemo(() => {
    const stats: Record<string, { 
      name: string, 
      vendas: number, 
      faturamento: number, 
      custo: number, 
      taxas: number, 
      lucro: number, 
      margem: number 
    }> = {};

    orders.forEach(o => {
      if (!stats[o.product]) {
        stats[o.product] = { 
          name: o.product, 
          vendas: 0, 
          faturamento: 0, 
          custo: 0, 
          taxas: 0, 
          lucro: 0, 
          margem: 0 
        };
      }
      stats[o.product].vendas += o.quantity;
      stats[o.product].faturamento += o.saleValue;
      stats[o.product].custo += o.totalCost;
      stats[o.product].taxas += (o.marketplaceTax + o.otherTaxes + o.subFrete);
      stats[o.product].lucro += o.profit;
    });

    return Object.values(stats).map(s => ({
      ...s,
      margem: s.faturamento > 0 ? (s.lucro / s.faturamento) * 100 : 0
    }));
  }, [orders]);

  const topStats = useMemo(() => {
    if (productStats.length === 0) return null;
    return {
      mostProfitable: [...productStats].sort((a, b) => b.lucro - a.lucro)[0],
      mostSold: [...productStats].sort((a, b) => b.vendas - a.vendas)[0],
      bestMargin: [...productStats].sort((a, b) => b.margem - a.margem)[0],
      atLoss: productStats.filter(s => s.lucro < 0).length
    };
  }, [productStats]);

  if (loading) return <div>Carregando análise...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rentabilidade por Produto</h1>
        <p className="text-slate-500">Analise quais produtos trazem mais retorno para o seu negócio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Mais Lucrativo</p>
            <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{topStats?.mostProfitable?.name || '-'}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Mais Vendido</p>
            <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{topStats?.mostSold?.name || '-'}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Melhor Margem</p>
            <h4 className="text-sm font-bold text-slate-900">{topStats?.bestMargin?.margem.toFixed(1) || '0'}%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Produtos com Prejuízo</p>
            <h4 className="text-sm font-bold text-slate-900">{topStats?.atLoss || 0}</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Produto</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Vendas</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Faturamento</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Custo Total</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Taxas</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Lucro Líquido</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Margem %</th>
              </tr>
            </thead>
            <tbody>
              {productStats.map((stat, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">{stat.name}</td>
                  <td className="p-4 text-sm text-center font-medium text-slate-600">{stat.vendas}</td>
                  <td className="p-4 text-sm text-right font-medium text-slate-900">R$ {stat.faturamento.toFixed(2)}</td>
                  <td className="p-4 text-sm text-right text-slate-500">R$ {stat.custo.toFixed(2)}</td>
                  <td className="p-4 text-sm text-right text-slate-500">R$ {stat.taxas.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={cn(
                      "text-sm font-bold",
                      stat.lucro >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      R$ {stat.lucro.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            stat.margem >= 15 ? "bg-emerald-500" : stat.margem >= 0 ? "bg-amber-500" : "bg-rose-500"
                          )} 
                          style={{ width: `${Math.max(0, Math.min(100, stat.margem))}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-bold min-w-[40px]",
                        stat.margem >= 15 ? "text-emerald-600" : stat.margem >= 0 ? "text-amber-500" : "text-rose-600"
                      )}>
                        {stat.margem.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {productStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Nenhum dado disponível para análise.
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
