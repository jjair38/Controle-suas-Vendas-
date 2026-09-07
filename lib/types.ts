export type Marketplace = 'Shopee' | 'Mercado Livre';

export interface Order {
  id?: string;
  marketplace: Marketplace;
  date: string;
  orderId: string;
  sku: string;
  product: string;
  quantity: number;
  material: string;
  energy: number;
  filament: number;
  maintenance: number;
  packaging: number;
  otherCosts: number;
  totalCost: number;
  saleValue: number;
  marketplaceTax: number;
  otherTaxes: number;
  subFrete: number;
  netValue: number;
  profit: number;
  margin: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Product {
  id?: string;
  name: string;
  sku: string;
  material: string;
  filamentWeight: number;
  filamentCostPerGram: number;
  printTime: number;
  energyConsumption: number;
  energyCost: number;
  maintenanceCostPerHour: number;
  packagingCost: number;
  otherCosts: number;
  totalEstimatedCost: number;
  sellingPrice: number;
  userId: string;
}

export interface Settings {
  energy: {
    kWhPrice: number;
    printerConsumption: number; // Watts
  };
  maintenance: {
    totalCost: number;
    hours: number;
    costPerHour: number;
  };
  userId: string;
}

export interface Material {
  id?: string;
  name: string;
  rollPrice: number;
  rollWeight: number; // grams
  costPerGram: number;
  userId: string;
}
