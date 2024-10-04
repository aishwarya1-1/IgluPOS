// context/UserContext.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';

interface UserContextType {
  userId: string | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, userId }: { children: ReactNode; userId: string | undefined }) => {
  return (
    <UserContext.Provider value={{ userId }}>
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
