'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuth } from '@/lib/auth-context';
import { User, Shield, Bell, Database } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-500">Gerencie sua conta e preferências do sistema.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <User size={24} className="text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">Perfil</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <img src={user?.photoURL || ''} alt={user?.displayName || ''} className="w-16 h-16 rounded-2xl" />
              <div>
                <p className="font-bold text-slate-900">{user?.displayName}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Autenticação Google</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Ativo</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <Database size={24} className="text-purple-600" />
              <h3 className="text-xl font-bold text-slate-800">Dados do Sistema</h3>
            </div>
            
            <p className="text-sm text-slate-600">
              Seus dados estão armazenados com segurança no Firebase Firestore. 
              Sincronização em tempo real ativada para todos os dispositivos.
            </p>

            <div className="pt-4">
              <button 
                onClick={() => alert('Em breve: Exportação completa de backup.')}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Database size={20} />
                Fazer Backup dos Dados
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
