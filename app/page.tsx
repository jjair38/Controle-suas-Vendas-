'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default function HomePage() {
  return (
    <MainLayout>
      <DashboardClient />
    </MainLayout>
  );
}
