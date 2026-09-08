'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProfitabilityClient } from '@/components/analysis/profitability-client';

export default function RentabilidadePage() {
  return (
    <MainLayout>
      <ProfitabilityClient />
    </MainLayout>
  );
}
