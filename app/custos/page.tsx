'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CostsConfig } from '@/components/settings/costs-config';

export default function CostsPage() {
  return (
    <MainLayout>
      <CostsConfig />
    </MainLayout>
  );
}
