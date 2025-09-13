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

const defaultBusiness: Business | null = null;

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load companies from Supabase and localStorage
  useEffect(() => {
    const loadBusinesses = async () => {
      let loadedBusinesses: Business[] = [];

      // First try to load from Supabase
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { safeGetSession } = await import('@/integrations/supabase/safeAuth');

        const { data: session } = await safeGetSession();
        const user = session?.session?.user;

        if (user) {
          // Get user's companies from company_users table
          const { data: userCompanies } = await supabase
            .from('company_users')
            .select(`
              company_id,
              role,
              companies (
                id,
                name,
                business_type,
                tax_id,
                business_license,
                phone,
                email,
                logo_url,
                address,
                city,
                state,
                postal_code,
                country,
                created_at
              )
            `)
            .eq('user_id', user.id);

          if (userCompanies && userCompanies.length > 0) {
            loadedBusinesses = userCompanies
              .filter(uc => uc.companies)
              .map(uc => {
                const company = uc.companies as any;
                return {
                  id: String(company.id),
                  businessName: company.name || '',
                  businessType: company.business_type || 'retail',
                  taxId: company.tax_id || '',
                  businessLicense: company.business_license || '',
                  phone: company.phone || '',
                  email: company.email || '',
                  logoUrl: company.logo_url || '',
                  address: company.address || '',
                  city: company.city || '',
                  state: company.state || '',
                  postalCode: company.postal_code || '',
                  country: company.country || 'US',
                  operatingHours: defaultOperatingHours,
                  createdAt: company.created_at || new Date().toISOString(),
                } as Business;
              });
          }

          // If no companies found, check if user has a company_id in system_users
          if (loadedBusinesses.length === 0) {
            const { data: systemUser } = await supabase
              .from('system_users')
              .select('company_id')
              .eq('id', user.id)
              .maybeSingle();

            if (systemUser?.company_id) {
              const { data: company } = await supabase
                .from('companies')
                .select('*')
                .eq('id', systemUser.company_id)
                .maybeSingle();

              if (company) {
                loadedBusinesses = [{
                  id: String(company.id),
                  businessName: company.name || '',
                  businessType: company.business_type || 'retail',
                  taxId: company.tax_id || '',
                  businessLicense: company.business_license || '',
                  phone: company.phone || '',
                  email: company.email || '',
                  logoUrl: company.logo_url || '',
                  address: company.address || '',
                  city: company.city || '',
                  state: company.state || '',
                  postalCode: company.postal_code || '',
                  country: company.country || 'US',
                  operatingHours: defaultOperatingHours,
                  createdAt: company.created_at || new Date().toISOString(),
                }];
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load companies from Supabase:', error);
      }

      // Fallback to localStorage if no companies found in database
      if (loadedBusinesses.length === 0) {
        const savedBusinesses = localStorage.getItem('pos-businesses');
        if (savedBusinesses) {
          try {
            loadedBusinesses = JSON.parse(savedBusinesses);
          } catch (error) {
            console.error('Error loading businesses from localStorage:', error);
          }
        }
      }

      setBusinesses(loadedBusinesses);

      // Set current business
      const savedCurrentId = localStorage.getItem('pos-current-business-id');
      if (savedCurrentId) {
        const current = loadedBusinesses.find((b: Business) => b.id === savedCurrentId);
        setCurrentBusinessState(current || null);
      } else if (loadedBusinesses.length > 0) {
        // Auto-select first business if none selected
        setCurrentBusinessState(loadedBusinesses[0]);
      }

      setIsLoaded(true);
    };

    loadBusinesses();
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
    setBusinesses(prev => prev.filter(b => b.id !== id));
    if (currentBusiness?.id === id) {
      const remaining = businesses.filter(b => b.id !== id);
      setCurrentBusinessState(remaining[0] || null);
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
