'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { OrdersClient } from '@/components/orders/orders-client';

export default function OrdersPage() {
  return (
    <MainLayout>
      <OrdersClient />
    </MainLayout>
  );
}
