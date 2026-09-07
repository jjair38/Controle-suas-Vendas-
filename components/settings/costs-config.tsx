'use client';

import React, { useState } from 'react';
import { useSettings, useMaterials } from '@/hooks/use-data';
import { 
  Zap, 
  Hammer, 
  Package, 
  Trash2, 
  Plus, 
  Save, 
  Info,
  CircleDollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';

export function CostsConfig() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { materials, addMaterial } = useMaterials();
  
  const [newMaterial, setNewMaterial] = useState({ name: '', rollPrice: 0, rollWeight: 1000 });
  const [energyForm, setEnergyForm] = useState({ kWhPrice: 0, printerConsumption: 0 });
  const [maintenanceForm, setMaintenanceForm] = useState({ totalCost: 0, hours: 0 });

  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (settings && !initialized.current) {
      setEnergyForm({ kWhPrice: settings.energy.kWhPrice, printerConsumption: settings.energy.printerConsumption });
      setMaintenanceForm({ totalCost: settings.maintenance.totalCost, hours: settings.maintenance.hours });
      initialized.current = true;
    }
  }, [settings]);

  const handleSaveEnergy = async () => {
    await updateSettings({ energy: energyForm });
    alert('Configurações de energia salvas!');
  };

  const handleSaveMaintenance = async () => {
    const costPerHour = maintenanceForm.hours > 0 ? maintenanceForm.totalCost / maintenanceForm.hours : 0;
    await updateSettings({ maintenance: { ...maintenanceForm, costPerHour } });
    alert('Configurações de manutenção salvas!');
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || newMaterial.rollPrice <= 0) return;
    const costPerGram = newMaterial.rollPrice / newMaterial.rollWeight;
    await addMaterial({ ...newMaterial, costPerGram });
    setNewMaterial({ name: '', rollPrice: 0, rollWeight: 1000 });
  };

  const handleDeleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, 'materials', id));
  };

  return (
    <div className="space-y-10">
      <div className="pb-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações de Custo</h1>
        <p className="text-slate-500 mt-1 font-medium">Defina os parâmetros base para o cálculo automatizado de rentabilidade.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energia */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 space-y-8"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm shadow-blue-100">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Energia Elétrica</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Custos Operacionais</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Preço do kWh (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={energyForm.kWhPrice}
                onChange={(e) => setEnergyForm({ ...energyForm, kWhPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Consumo (Watts)</label>
              <input 
                type="number"
                value={energyForm.printerConsumption}
                onChange={(e) => setEnergyForm({ ...energyForm, printerConsumption: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-slate-700" 
              />
            </div>
          </div>
          <button 
            onClick={handleSaveEnergy}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-100 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            <Save size={20} className="group-hover:scale-110 transition-transform" />
            Atualizar Energia
          </button>
        </motion.div>

        {/* Manutenção */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 space-y-8"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-sm shadow-amber-100">
              <Hammer size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Manutenção</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Amortização de Ativos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Custo Total (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={maintenanceForm.totalCost}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, totalCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Ciclo (Horas)</label>
              <input 
                type="number"
                value={maintenanceForm.hours}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-bold text-slate-700" 
              />
            </div>
          </div>
          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex justify-between items-center shadow-inner">
            <span className="text-[13px] font-bold text-amber-700 uppercase tracking-wider">Hourly Rate:</span>
            <span className="text-xl font-black text-amber-600">R$ {settings?.maintenance.costPerHour.toFixed(2) || '0.00'}</span>
          </div>
          <button 
            onClick={handleSaveMaintenance}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-100 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            <Save size={20} className="group-hover:scale-110 transition-transform" />
            Atualizar Manutenção
          </button>
        </motion.div>

        {/* Materiais / Filamentos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-10 rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100/60 space-y-8 lg:col-span-2"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm shadow-emerald-100">
              <CircleDollarSign size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Banco de Materiais</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filamentos e Insumos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end p-8 bg-slate-50/30 rounded-3xl border border-slate-100/50">
            <div className="space-y-2.5 md:col-span-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nome do Material</label>
              <input 
                type="text" 
                placeholder="Ex: PLA Silk Gold"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="w-full px-5 py-3.5 bg-white border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-bold text-slate-700 shadow-sm" 
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Preço Rolo (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={newMaterial.rollPrice}
                onChange={(e) => setNewMaterial({ ...newMaterial, rollPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-white border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-bold text-slate-700 shadow-sm" 
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Peso (g)</label>
              <input 
                type="number"
                value={newMaterial.rollWeight}
                onChange={(e) => setNewMaterial({ ...newMaterial, rollWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 bg-white border border-slate-200/60 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-bold text-slate-700 shadow-sm" 
              />
            </div>
            <button 
              onClick={handleAddMaterial}
              className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 group active:scale-95"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {materials.map((m) => (
              <div key={m.id} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group border-l-4 border-l-emerald-500">
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight">{m.name}</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                    R$ {m.rollPrice.toFixed(2)} / {m.rollWeight}g <span className="mx-2 text-slate-200">|</span> 
                    <span className="text-emerald-600">R$ {m.costPerGram.toFixed(4)}/g</span>
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteMaterial(m.id!)}
                  className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm group-hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
