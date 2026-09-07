'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Product, Settings, Material } from '@/lib/types';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const addProduct = async (product: Omit<Product, 'id' | 'userId'>) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, 'products'), { ...product, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  return { products, loading, addProduct };
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'settings', user.uid);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        // Initial settings
        const initial: Settings = {
          energy: { kWhPrice: 0, printerConsumption: 0 },
          maintenance: { totalCost: 0, hours: 0, costPerHour: 0 },
          userId: user.uid
        };
        setSettings(initial);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;
    const docRef = doc(db, 'settings', user.uid);
    try {
      return await setDoc(docRef, { ...settings, ...newSettings, userId: user.uid }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `settings/${user.uid}`);
    }
  };

  return { settings, loading, updateSettings };
}

export function useMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'materials'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Material[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const addMaterial = async (material: Omit<Material, 'id' | 'userId'>) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, 'materials'), { ...material, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'materials');
    }
  };

  return { materials, loading, addMaterial };
}
