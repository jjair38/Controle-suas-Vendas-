'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default function DashboardPage() {
  return (
    <MainLayout>
      <DashboardClient />
    </MainLayout>
  );
}
