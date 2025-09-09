import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Business {
  id: string;
  businessName: string;
  businessType: string;
  taxId: string;
  businessLicense: string;
  phone: string;
  email: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  createdAt: string;
}

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => void;
  updateBusiness: (id: string, business: Partial<Business>) => void;
  setCurrentBusiness: (id: string) => void;
  deleteBusiness: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const defaultOperatingHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: false },
  sunday: { open: '09:00', close: '17:00', closed: true },
};

const defaultBusiness: Business = {
  id: '1',
  businessName: 'Freshmart',
  businessType: 'grocery',
  taxId: '',
  businessLicense: '',
  phone: '',
  email: '',
  logoUrl: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  operatingHours: defaultOperatingHours,
  createdAt: new Date().toISOString(),
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([defaultBusiness]);
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(defaultBusiness);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBusinesses = localStorage.getItem('pos-businesses');
    const savedCurrentId = localStorage.getItem('pos-current-business-id');
    
    if (savedBusinesses) {
      try {
        const parsed = JSON.parse(savedBusinesses);
        setBusinesses(parsed);
        
        if (savedCurrentId) {
          const current = parsed.find((b: Business) => b.id === savedCurrentId);
          setCurrentBusinessState(current || parsed[0]);
        } else {
          setCurrentBusinessState(parsed[0]);
        }
      } catch (error) {
        console.error('Error loading businesses from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage when businesses change
  useEffect(() => {
    localStorage.setItem('pos-businesses', JSON.stringify(businesses));
  }, [businesses]);

  // Save current business ID when it changes
  useEffect(() => {
    if (currentBusiness) {
      localStorage.setItem('pos-current-business-id', currentBusiness.id);
    }
  }, [currentBusiness]);

  const addBusiness = (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...businessData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      operatingHours: businessData.operatingHours || defaultOperatingHours,
    };
    
    setBusinesses(prev => [...prev, newBusiness]);
    return newBusiness.id;
  };

  const updateBusiness = (id: string, updates: Partial<Business>) => {
    setBusinesses(prev => 
      prev.map(business => 
        business.id === id ? { ...business, ...updates } : business
      )
    );
    
    // Update current business if it's the one being updated
    if (currentBusiness?.id === id) {
      setCurrentBusinessState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const setCurrentBusiness = (id: string) => {
    const business = businesses.find(b => b.id === id);
    if (business) {
      setCurrentBusinessState(business);
    }
  };

  const deleteBusiness = (id: string) => {
    if (businesses.length <= 1) {
      throw new Error('Cannot delete the last business');
    }
    
    setBusinesses(prev => prev.filter(b => b.id !== id));
    
    // If deleting current business, switch to first remaining business
    if (currentBusiness?.id === id) {
      const remaining = businesses.filter(b => b.id !== id);
      setCurrentBusinessState(remaining[0]);
    }
  };

  return (
    <BusinessContext.Provider value={{
      businesses,
      currentBusiness,
      addBusiness,
      updateBusiness,
      setCurrentBusiness,
      deleteBusiness
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};