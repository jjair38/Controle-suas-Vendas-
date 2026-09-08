'use client';

import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { 
  FileUp, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Table as TableIcon,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Marketplace, Order } from '@/lib/types';
import { useOrders } from '@/hooks/use-orders';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';

interface ImportResult {
  total: number;
  newCount: number;
  duplicateCount: number;
  errorCount: number;
  validOrders: Partial<Order>[];
}

export function CSVImport() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadModel = () => {
    const headers = [
      'Marketplace', 'Data', 'ID do Pedido', 'Produto', 'Quantidade', 
      'Material', 'Energia', 'Filamento', 'Manutenção', 'Embalagem', 
      'Outros Custos', 'Venda', 'Taxa Marketplace', 'Outras Taxas', 'Frete Subsidiado'
    ];
    const csvContent = headers.join(';') + '\n' + 
      'Shopee;2024-05-05;ABC12345;Vaso Decorativo;2;PLA;0.50;5.00;1.00;2.00;0.00;120.00;15.00;2.00;0.00';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao_crm.csv';
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processCSV(selectedFile);
    }
  };

  const processCSV = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(';').map(h => h.trim());
      
      const ordersToProcess = lines.slice(1).filter(l => l.trim() !== '');
      const validOrders: Partial<Order>[] = [];
      let duplicateCount = 0;
      let errorCount = 0;

      for (const line of ordersToProcess) {
        const values = line.split(';').map(v => v.trim());
        if (values.length < 15) {
          errorCount++;
          continue;
        }

        const rawOrder = {
          marketplace: values[0] as Marketplace,
          date: values[1],
          orderId: values[2],
          product: values[3],
          quantity: parseFloat(values[4]) || 0,
          material: values[5],
          energy: parseFloat(values[6]) || 0,
          filament: parseFloat(values[7]) || 0,
          maintenance: parseFloat(values[8]) || 0,
          packaging: parseFloat(values[9]) || 0,
          otherCosts: parseFloat(values[10]) || 0,
          saleValue: parseFloat(values[11]) || 0,
          marketplaceTax: parseFloat(values[12]) || 0,
          otherTaxes: parseFloat(values[13]) || 0,
          subFrete: parseFloat(values[14]) || 0,
        };

        // Basic validation
        if (!rawOrder.orderId || !rawOrder.marketplace || !rawOrder.date) {
          errorCount++;
          continue;
        }

        // Check for duplicate
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user?.uid),
          where('orderId', '==', rawOrder.orderId),
          where('marketplace', '==', rawOrder.marketplace)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          duplicateCount++;
        } else {
          // Calculate missing fields
          const totalCost = (rawOrder.energy + rawOrder.filament + rawOrder.maintenance + rawOrder.packaging + rawOrder.otherCosts) * rawOrder.quantity;
          const totalTax = rawOrder.marketplaceTax + rawOrder.otherTaxes + rawOrder.subFrete;
          const netValue = rawOrder.saleValue - totalTax;
          const profit = netValue - totalCost;
          const margin = rawOrder.saleValue > 0 ? (profit / rawOrder.saleValue) * 100 : 0;

          validOrders.push({
            ...rawOrder,
            totalCost,
            netValue,
            profit,
            margin,
            status: 'Concluído',
            userId: user?.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      setResult({
        total: ordersToProcess.length,
        newCount: validOrders.length,
        duplicateCount,
        errorCount,
        validOrders
      });
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!result) return;
    setIsImporting(true);
    try {
      for (const order of result.validOrders) {
        await addDoc(collection(db, 'orders'), order);
      }
      setResult(null);
      setFile(null);
      setError(null);
      alert('Importação concluída com sucesso!');
    } catch (err) {
      setError('Erro ao importar pedidos. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Importar CSV</h1>
        <p className="text-slate-500">Importe seus pedidos em massa a partir de uma planilha.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <FileUp size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Selecione seu arquivo</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Arraste seu arquivo CSV ou clique no botão abaixo para selecionar.</p>
            </div>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
              ref={fileInputRef} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Procurar Arquivo
            </button>
            <button 
              onClick={downloadModel}
              className="flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm"
            >
              <Download size={16} />
              Baixar Modelo CSV (Ponto e Vírgula)
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <Info size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Dicas para Importação</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Use o delimitador de ponto e vírgula (;).',
                'O ID do pedido deve ser único por marketplace.',
                'Datas devem estar no formato YYYY-MM-DD.',
                'Valores decimais devem usar ponto (ex: 10.50).',
                'Pedidos já existentes no CRM serão ignorados automaticamente.'
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Pré-visualização</h3>
                <button onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">{result.total}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Encontrado</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-600">{result.newCount}</p>
                  <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-tight">Novos Registros</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <p className="text-2xl font-black text-amber-600">{result.duplicateCount}</p>
                  <p className="text-xs font-bold text-amber-600/70 uppercase tracking-tight">Duplicados (Ignorados)</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-center">
                  <p className="text-2xl font-black text-rose-600">{result.errorCount}</p>
                  <p className="text-xs font-bold text-rose-600/70 uppercase tracking-tight">Com Erro</p>
                </div>
              </div>

              {result.newCount > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
                    <CheckCircle2 size={18} />
                    Pronto para importar {result.newCount} novos registros.
                  </div>
                  <button 
                    onClick={confirmImport}
                    disabled={isImporting}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold transition-all shadow-lg",
                      isImporting ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                    )}
                  >
                    {isImporting ? 'Importando...' : 'Confirmar Importação'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm">
                  <AlertCircle size={18} />
                  Nenhum novo registro válido encontrado para importação.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
