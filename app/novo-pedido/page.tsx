'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { NewOrderForm } from '@/components/orders/new-order-form';

export default function NewOrderPage() {
  return (
    <MainLayout>
      <NewOrderForm />
    </MainLayout>
  );
}
