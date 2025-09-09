import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './ProductContext';

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  receiptTemplate: string;
  salesPerson?: string;
  createdAt: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt'>) => string;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSale: (id: string) => Sale | undefined;
  getSalesByDate: (date: string) => Sale[];
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[];
  getTotalSales: () => number;
  getTodaysSales: () => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { updateStock } = useProducts();

  // Load sales from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('pos-sales');
    if (savedSales) {
      try {
        setSales(JSON.parse(savedSales));
      } catch (error) {
        console.error('Error loading sales:', error);
      }
    }
  }, []);

  // Save to localStorage when sales change
  useEffect(() => {
    localStorage.setItem('pos-sales', JSON.stringify(sales));
  }, [sales]);

  const generateInvoiceNo = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const existingCount = sales.filter(sale => 
      sale.invoiceNo.startsWith(`INV-${dateStr}`)
    ).length;
    return `INV-${dateStr}-${(existingCount + 1).toString().padStart(4, '0')}`;
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      invoiceNo: generateInvoiceNo(),
      createdAt: new Date().toISOString()
    };

    // Update stock for each item sold
    if (newSale.status === 'completed') {
      newSale.items.forEach(item => {
        // Note: This would need the current stock to subtract properly
        // For now, we'll just trigger the update hook
        updateStock(item.productId, -item.quantity); // Negative to reduce stock
      });
    }

    setSales(prev => [...prev, newSale]);
    return newSale.id;
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...updates } : sale
    ));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  const getSale = (id: string) => {
    return sales.find(sale => sale.id === id);
  };

  const getSalesByDate = (date: string) => {
    return sales.filter(sale => sale.date === date);
  };

  const getSalesByDateRange = (startDate: string, endDate: string) => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return saleDate >= start && saleDate <= end;
    });
  };

  const getTotalSales = () => {
    return sales
      .filter(sale => sale.status === 'completed')
      .reduce((total, sale) => total + sale.total, 0);
  };

  const getTodaysSales = () => {
    const today = new Date().toISOString().split('T')[0];
    return getSalesByDate(today);
  };

  return (
    <SalesContext.Provider value={{
      sales,
      addSale,
      updateSale,
      deleteSale,
      getSale,
      getSalesByDate,
      getSalesByDateRange,
      getTotalSales,
      getTodaysSales
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};