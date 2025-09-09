import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as initialProducts } from '@/data/posData';

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

  // Load products from localStorage or use initial data
  useEffect(() => {
    const savedProducts = localStorage.getItem('pos-products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }
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