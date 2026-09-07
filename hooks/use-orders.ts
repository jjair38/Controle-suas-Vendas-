'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function useOrders(period: string = 'last30') {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'last7':
        startDate = subDays(now, 7);
        break;
      case 'last30':
        startDate = subDays(now, 30);
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        break;
      default:
        startDate = subDays(now, 30);
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      // where('date', '>=', startDate.toISOString()), // Firestore needs proper indexing or just client-side filter for simplicity if volume is low
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      if (ordersData.length === 0) {
        // Mock data for demonstration
        const mockData: Order[] = [
          {
            id: 'mock1',
            marketplace: 'Shopee',
            date: subDays(new Date(), 2).toISOString(),
            orderId: 'DEMO-123456',
            sku: 'VASO-01',
            product: 'Vaso Decorativo Moderno',
            quantity: 2,
            material: 'PLA',
            energy: 0.5,
            filament: 5.0,
            maintenance: 1.0,
            packaging: 2.0,
            otherCosts: 0,
            totalCost: 17.0,
            saleValue: 120.0,
            marketplaceTax: 18.0,
            otherTaxes: 0,
            subFrete: 0,
            netValue: 102.0,
            profit: 85.0,
            margin: 70.8,
            status: 'Concluído',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.uid
          },
          {
            id: 'mock2',
            marketplace: 'Mercado Livre',
            date: subDays(new Date(), 5).toISOString(),
            orderId: 'DEMO-ML-789',
            sku: 'EST-02',
            product: 'Estátua Pensador',
            quantity: 1,
            material: 'PETG',
            energy: 1.2,
            filament: 12.0,
            maintenance: 2.5,
            packaging: 5.0,
            otherCosts: 0,
            totalCost: 20.7,
            saleValue: 180.0,
            marketplaceTax: 32.0,
            otherTaxes: 2.0,
            subFrete: 15.0,
            netValue: 131.0,
            profit: 110.3,
            margin: 61.3,
            status: 'Concluído',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.uid
          }
        ];
        ordersData = mockData;
      }

      // Client side filter
      const filtered = ordersData.filter(o => new Date(o.date) >= startDate);
      setOrders(filtered);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, period]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, 'orders'), {
        ...order,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  return { orders, loading, addOrder };
}
