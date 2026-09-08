'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CSVImport } from '@/components/import/csv-import';

export default function ImportarPage() {
  return (
    <MainLayout>
      <CSVImport />
    </MainLayout>
  );
}
