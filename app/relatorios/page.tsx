'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ReportsClient } from '@/components/reports/reports-client';

export default function RelatoriosPage() {
  return (
    <MainLayout>
      <ReportsClient />
    </MainLayout>
  );
}
