'use client';

import React, { useState, useEffect } from 'react';
import { useProducts, useSettings, useMaterials } from '@/hooks/use-data';
import { useOrders } from '@/hooks/use-orders';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Calculator, 
  Package, 
  Info,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Marketplace, Order, Product } from '@/lib/types';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const orderSchema = z.object({
  marketplace: z.enum(['Shopee', 'Mercado Livre']),
  date: z.string(),
  orderId: z.string().min(1, 'ID do pedido é obrigatório'),
  sku: z.string().optional(),
  product: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().min(1),
  saleValue: z.number().min(0),
  marketplaceTax: z.number().min(0),
  otherTaxes: z.number().min(0),
  subFrete: z.number().min(0),
  material: z.string(),
  energy: z.number().min(0),
  filament: z.number().min(0),
  maintenance: z.number().min(0),
  packaging: z.number().min(0),
  otherCosts: z.number().min(0),
});

type OrderFormData = z.infer<typeof orderSchema>;

export function NewOrderForm() {
  const router = useRouter();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { materials } = useMaterials();
  const { addOrder } = useOrders();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      marketplace: 'Shopee',
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      saleValue: 0,
      marketplaceTax: 0,
      otherTaxes: 0,
      subFrete: 0,
      energy: 0,
      filament: 0,
      maintenance: 0,
      packaging: 0,
      otherCosts: 0,
    }
  });

  const values = watch();

  const calculations = React.useMemo(() => {
    const totalCost = (values.energy + values.filament + values.maintenance + values.packaging + values.otherCosts) * (values.quantity || 1);
    const totalTax = values.marketplaceTax + values.otherTaxes + values.subFrete;
    const netValue = values.saleValue - totalTax;
    const profit = netValue - totalCost;
    const margin = values.saleValue > 0 ? (profit / values.saleValue) * 100 : 0;

    return { totalCost, totalTax, netValue, profit, margin };
  }, [values]);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue('product', product.name);
      setValue('sku', product.sku);
      setValue('material', product.material);
      setValue('energy', product.energyCost);
      setValue('filament', product.filamentWeight * product.filamentCostPerGram);
      setValue('maintenance', product.maintenanceCostPerHour * (product.printTime / 60)); // assuming printTime is min
      setValue('packaging', product.packagingCost);
      setValue('otherCosts', product.otherCosts);
      setValue('saleValue', product.sellingPrice);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      await addOrder({
        ...data,
        sku: data.sku || '',
        totalCost: calculations.totalCost,
        netValue: calculations.netValue,
        profit: calculations.profit,
        margin: calculations.margin,
        status: 'Concluído',
      });
      router.push('/pedidos');
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pedidos" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Novo Pedido</h1>
        </div>
        <button 
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Save size={20} />
          Salvar Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Venda */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <ShoppingBag size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Informações da Venda</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Marketplace</label>
                <select 
                  {...register('marketplace')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Mercado Livre">Mercado Livre</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Data</label>
                <input 
                  type="date" 
                  {...register('date')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ID do Pedido</label>
                <input 
                  type="text" 
                  {...register('orderId')}
                  placeholder="Ex: 240505ABC123"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.orderId && <p className="text-xs text-red-500">{errors.orderId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Selecionar Produto (Opcional)</label>
                <select 
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione um produto cadastrado...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nome do Produto</label>
                <input 
                  type="text" 
                  {...register('product')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Quantidade</label>
                  <input 
                    type="number" 
                    {...register('quantity', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Valor de Venda (Un)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    {...register('saleValue', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Custos de Produção */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
                <Package size={20} className="text-amber-600" />
                <h3 className="font-bold text-slate-800">Custos de Produção</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Filamento (R$)</label>
                  <input type="number" step="0.01" {...register('filament', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Energia (R$)</label>
                  <input type="number" step="0.01" {...register('energy', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Manutenção (R$)</label>
                  <input type="number" step="0.01" {...register('maintenance', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Embalagem (R$)</label>
                  <input type="number" step="0.01" {...register('packaging', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Outros (R$)</label>
                  <input type="number" step="0.01" {...register('otherCosts', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
            </div>

            {/* Taxas Marketplace */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
                <TrendingDown size={20} className="text-rose-600" />
                <h3 className="font-bold text-slate-800">Taxas Marketplace</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Taxa Marketplace (R$)</label>
                  <input type="number" step="0.01" {...register('marketplaceTax', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Outras Taxas (R$)</label>
                  <input type="number" step="0.01" {...register('otherTaxes', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Frete Subsidiado (R$)</label>
                  <input type="number" step="0.01" {...register('subFrete', { valueAsNumber: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-8">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50 mb-6">
              <Calculator size={20} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800">Resumo Financeiro</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Custo Total</span>
                <span className="font-bold text-slate-900 text-lg">R$ {calculations.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Taxas Totais</span>
                <span className="font-bold text-rose-600 text-lg">R$ {calculations.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Repasse Líquido</span>
                <span className="font-bold text-blue-600 text-lg">R$ {calculations.netValue.toFixed(2)}</span>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl space-y-1",
                calculations.profit >= 0 ? "bg-emerald-50" : "bg-rose-50"
              )}>
                <div className="flex justify-between items-center">
                  <span className={cn("text-sm font-semibold", calculations.profit >= 0 ? "text-emerald-700" : "text-rose-700")}>
                    Lucro Real
                  </span>
                  <span className={cn("text-xl font-black", calculations.profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    R$ {calculations.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Margem de Lucro</span>
                  <span className={cn("text-sm font-bold", calculations.margin >= 15 ? "text-emerald-600" : calculations.margin >= 0 ? "text-amber-500" : "text-rose-600")}>
                    {calculations.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                O repasse é calculado subtraindo as taxas do valor de venda. 
                O lucro é o repasse menos os custos totais de produção (filamento, energia, etc).
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
