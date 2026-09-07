'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/use-orders';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar,
  ShoppingBag,
  Package,
  CircleDollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export function ReportsClient() {
  const { orders, loading } = useOrders('last30');
  const [period, setPeriod] = useState('thisMonth');
  const [marketplace, setMarketplace] = useState('Todos');

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (marketplace !== 'Todos') {
      result = result.filter(o => o.marketplace === marketplace);
    }
    return result;
  }, [orders, marketplace]);

  const exportToCSV = () => {
    const headers = ['Data', 'Marketplace', 'ID Pedido', 'Produto', 'Qtd', 'Venda', 'Custo', 'Lucro', 'Margem %'];
    const rows = filteredOrders.map(o => [
      format(parseISO(o.date), 'dd/MM/yyyy'),
      o.marketplace,
      o.orderId,
      o.product,
      o.quantity,
      o.saleValue.toFixed(2),
      o.totalCost.toFixed(2),
      o.profit.toFixed(2),
      o.margin.toFixed(1)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_vendas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Carregando relatórios...</div>;

  return (
    <div className="space-y-8 print:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-500">Gere relatórios detalhados e exporte seus dados.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            <Printer size={18} />
            Imprimir / PDF
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Calendar size={18} />
            <span>Período</span>
          </div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="today">Hoje</option>
            <option value="last7">Últimos 7 dias</option>
            <option value="thisMonth">Este mês</option>
            <option value="lastMonth">Mês anterior</option>
          </select>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-orange-600 font-bold">
            <ShoppingBag size={18} />
            <span>Marketplace</span>
          </div>
          <select 
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="Todos">Todos</option>
            <option value="Shopee">Shopee</option>
            <option value="Mercado Livre">Mercado Livre</option>
          </select>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <Package size={18} />
            <span>Tipo de Relatório</span>
          </div>
          <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
            <option>Relatório Geral de Vendas</option>
            <option>Relatório de Lucratividade</option>
            <option>Relatório de Custos</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[600px] print:shadow-none print:border-none print:p-0">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Relatório de Vendas e Lucratividade</h2>
          <p className="text-slate-500 text-sm">
            Período: {period} | Marketplace: {marketplace} | Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold">
              <th className="py-2 px-1">DATA</th>
              <th className="py-2 px-1 text-center">MKTP</th>
              <th className="py-2 px-1">ID PEDIDO</th>
              <th className="py-2 px-1">PRODUTO</th>
              <th className="py-2 px-1 text-center">QTD</th>
              <th className="py-2 px-1 text-right">VENDA</th>
              <th className="py-2 px-1 text-right">CUSTO</th>
              <th className="py-2 px-1 text-right">LUCRO</th>
              <th className="py-2 px-1 text-center">MARGEM</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 px-1">{format(parseISO(o.date), 'dd/MM/yyyy')}</td>
                <td className="py-2 px-1 text-center">{o.marketplace.substring(0, 3).toUpperCase()}</td>
                <td className="py-2 px-1 font-mono">{o.orderId}</td>
                <td className="py-2 px-1 truncate max-w-[150px]">{o.product}</td>
                <td className="py-2 px-1 text-center">{o.quantity}</td>
                <td className="py-2 px-1 text-right">R$ {o.saleValue.toFixed(2)}</td>
                <td className="py-2 px-1 text-right">R$ {o.totalCost.toFixed(2)}</td>
                <td className="py-2 px-1 text-right font-bold">R$ {o.profit.toFixed(2)}</td>
                <td className="py-2 px-1 text-center">{o.margin.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
              <td colSpan={4} className="py-3 px-1">TOTAIS ({filteredOrders.length} PEDIDOS)</td>
              <td className="py-3 px-1 text-center">{filteredOrders.reduce((acc, o) => acc + o.quantity, 0)}</td>
              <td className="py-3 px-1 text-right">R$ {filteredOrders.reduce((acc, o) => acc + o.saleValue, 0).toFixed(2)}</td>
              <td className="py-3 px-1 text-right">R$ {filteredOrders.reduce((acc, o) => acc + o.totalCost, 0).toFixed(2)}</td>
              <td className="py-3 px-1 text-right">R$ {filteredOrders.reduce((acc, o) => acc + o.profit, 0).toFixed(2)}</td>
              <td className="py-3 px-1 text-center">
                {(filteredOrders.reduce((acc, o) => acc + o.profit, 0) / filteredOrders.reduce((acc, o) => acc + o.saleValue, 1) * 100).toFixed(1)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
