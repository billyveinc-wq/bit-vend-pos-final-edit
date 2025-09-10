import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as initialProducts } from '@/data/posData';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  sku?: string;
  barcode?: string;
  stock?: number;
  minStock?: number;
  brand?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  image?: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProduct: (id: number) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  updateStock: (id: number, newStock: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from Supabase if available; fallback to localStorage or initial data
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && Array.isArray(data) && data.length) {
          const mapped = data.map((row: any, idx: number) => ({
            id: idx + 1, // local ID for UI only; DB id is separate
            name: row.name,
            description: row.description || '',
            price: Number(row.price) || 0,
            category: row.category,
            sku: row.sku || undefined,
            barcode: row.barcode || undefined,
            stock: Number(row.stock) || 0,
            minStock: Number(row.min_stock) || 0,
            brand: row.brand || undefined,
            supplier: row.supplier || undefined,
            status: (row.status || 'active') as 'active' | 'inactive' | 'draft',
            image: row.image || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setProducts(mapped);
          return;
        }
      } catch (e) {
        console.warn('Supabase products fetch failed, falling back to local data');
      }
      const savedProducts = localStorage.getItem('pos-products');
      if (savedProducts) {
        try { setProducts(JSON.parse(savedProducts)); }
        catch { setProducts(initialProducts); }
      } else {
        setProducts(initialProducts);
      }
    };
    load();
  }, []);

  // Save to localStorage when products change
  useEffect(() => {
    localStorage.setItem('pos-products', JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: productData.status || 'active'
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct.id;
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    ));
    // Async sync to Supabase for stock or fields that exist in DB
    try {
      const current = products.find(p => p.id === id);
      const sku = current?.sku;
      if (sku) {
        const dbUpdates: any = {};
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
        if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
        if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
        if (Object.keys(dbUpdates).length > 0) {
          supabase.from('products').update(dbUpdates).eq('sku', sku);
        }
      }
    } catch {}
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: number) => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const updateStock = (id: number, newStock: number) => {
    updateProduct(id, { stock: newStock });
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      getProductsByCategory,
      updateStock
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
