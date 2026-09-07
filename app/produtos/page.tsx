'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductsClient } from '@/components/products/products-client';

export default function ProductsPage() {
  return (
    <MainLayout>
      <ProductsClient />
    </MainLayout>
  );
}
