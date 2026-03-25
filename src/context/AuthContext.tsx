import React, { createContext, useContext, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('kuri_admin') === 'true';
  });

  const login = async (email: string, pass: string) => {
    try {
      const authRef = doc(db, 'admin_auth', 'credentials');
      const authSnap = await getDoc(authRef);

        if (authSnap.exists()) {
          const data = authSnap.data();
          if (data.email === email && data.password === pass) {
            setIsAdmin(true);
            localStorage.setItem('kuri_admin', 'true');
            return true;
          }
        }
        
        return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('kuri_admin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
