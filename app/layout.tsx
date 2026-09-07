import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'CRM de Pedidos e Controle Financeiro',
  description: 'Controle de vendas marketplaces Shopee e Mercado Livre com foco em lucratividade.',
  openGraph: {
    title: 'CRM de Pedidos e Controle Financeiro',
    description: 'Controle de vendas marketplaces Shopee e Mercado Livre com foco em lucratividade.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
