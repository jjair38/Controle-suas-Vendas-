'use client';

import React, { useState } from 'react';
import { useProducts, useMaterials, useSettings } from '@/hooks/use-data';
import { 
  Box, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
  Zap,
  Hammer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { deleteDoc, doc, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function ProductsClient() {
  const { user } = useAuth();
  const { products, loading } = useProducts();
  const { materials } = useMaterials();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Produtos</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure seus custos base e preços de venda sugeridos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 group active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Cadastrar Produto
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100/60 bg-slate-50/30">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/60 rounded-[20px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-8 gap-8">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-100 rounded-[28px] p-8 space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <h3 className="font-black text-slate-800 text-lg tracking-tight leading-tight">{product.name}</h3>
                  <div className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.sku}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id!)} 
                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Custo Est.</span>
                  <p className="text-[15px] font-bold text-slate-600">R$ {product.totalEstimatedCost.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Venda Sug.</span>
                  <p className="text-[15px] font-black text-blue-600">R$ {product.sellingPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{product.material}</span>
                </div>
                <span className={cn(
                  "text-[12px] font-black px-3 py-1.5 rounded-xl shadow-sm border",
                  (product.sellingPrice - product.totalEstimatedCost) / product.sellingPrice > 0.2 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {((product.sellingPrice - product.totalEstimatedCost) / product.sellingPrice * 100).toFixed(1)}% Margem
                </span>
              </div>
            </motion.div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 shadow-inner">
                  <Box size={40} />
                </div>
                <div>
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Nenhum produto cadastrado</p>
                  <p className="text-slate-300 text-xs mt-1">Seus produtos aparecerão aqui após o cadastro.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            onClose={() => setIsModalOpen(false)} 
            materials={materials} 
            settings={settings}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ onClose, materials, settings, user }: { onClose: () => void, materials: any[], settings: any, user: any }) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    material: materials[0]?.name || 'PLA',
    filamentWeight: 0,
    filamentCostPerGram: materials[0]?.costPerGram || 0,
    printTime: 0,
    energyConsumption: settings?.energy.printerConsumption || 0,
    energyCost: 0,
    maintenanceCostPerHour: settings?.maintenance.costPerHour || 0,
    packagingCost: 0,
    otherCosts: 0,
    totalEstimatedCost: 0,
    sellingPrice: 0,
  });

  const calculateCosts = (data: Partial<Product>) => {
    const energyCost = (data.energyConsumption! / 1000) * (data.printTime! / 60) * (settings?.energy.kWhPrice || 0);
    const filamentCost = data.filamentWeight! * data.filamentCostPerGram!;
    const maintenanceCost = data.maintenanceCostPerHour! * (data.printTime! / 60);
    const total = energyCost + filamentCost + maintenanceCost + data.packagingCost! + data.otherCosts!;
    return { ...data, energyCost, totalEstimatedCost: total };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    if (type === 'number') newValue = parseFloat(value) || 0;
    
    if (name === 'material') {
      const mat = materials.find(m => m.name === value);
      if (mat) {
        setFormData(prev => calculateCosts({ ...prev, material: value, filamentCostPerGram: mat.costPerGram }));
        return;
      }
    }

    setFormData(prev => calculateCosts({ ...prev, [name]: newValue }));
  };

  const saveProduct = async () => {
    if (!formData.name || !formData.sku) return alert('Preencha Nome e SKU');
    try {
      await addDoc(collection(db, 'products'), { ...formData, userId: user.uid });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Cadastrar Novo Produto</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Identificação</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome do Produto</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">SKU</label>
                <input name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Custos de Impressão</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tempo (Minutos)</label>
                  <input type="number" name="printTime" value={formData.printTime} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Filamento (Gramas)</label>
                  <input type="number" name="filamentWeight" value={formData.filamentWeight} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Material</label>
                  <select name="material" value={formData.material} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none">
                    {materials.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Energia (Watts)</label>
                  <input type="number" name="energyConsumption" value={formData.energyConsumption} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Outros Custos e Venda</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Embalagem (R$)</label>
                  <input type="number" name="packagingCost" value={formData.packagingCost} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Outros (R$)</label>
                  <input type="number" name="otherCosts" value={formData.otherCosts} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Preço de Venda Sugerido (R$)</label>
                  <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} className="w-full px-4 py-3 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-800">Resumo Estimado</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Custo Total:</span>
                  <span className="font-bold">R$ {formData.totalEstimatedCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lucro Estimado:</span>
                  <span className="font-bold text-emerald-600">R$ {(formData.sellingPrice! - formData.totalEstimatedCost!).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Margem:</span>
                  <span className="font-bold text-emerald-600">{((formData.sellingPrice! - formData.totalEstimatedCost!) / formData.sellingPrice! * 100 || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
          <button onClick={saveProduct} className="px-10 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Salvar Produto</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
