// context/UserContext.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';

interface UserContextType {
  userId: string | undefined;
  billerName?: string | undefined;
  address?: string | undefined;
  companyName : string | undefined;
  gstNumber :string |undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ 
  children, 
  userId, 
  billerName, 
  address ,
  companyName,
  gstNumber
}: { 
  children: ReactNode; 
  userId: string | undefined;
  billerName?: string | null | undefined;
  address?: string | null | undefined;
  companyName? : string | null | undefined;
gstNumber? : string | null | undefined;
}) => {
  return (
    <UserContext.Provider value={{ 
      userId, 
      billerName: billerName || undefined,
      address: address || undefined,
      companyName : companyName || undefined,
      gstNumber :gstNumber || undefined

    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
