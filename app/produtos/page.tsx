'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductsClient } from '@/components/products/products-client';

export default function ProdutosPage() {
  return (
    <MainLayout>
      <ProductsClient />
    </MainLayout>
  );
}
