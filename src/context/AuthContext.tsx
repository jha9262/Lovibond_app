import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  role: UserRole;
  isMaster: boolean;
  isAdmin: boolean;
  login: (userId?: string, userRole?: UserRole, userName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('userId') || null;
  });
  const [userName, setUserName] = useState<string | null>(() => {
    return localStorage.getItem('userName') || null;
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('role') as UserRole) || 'USER';
  });

  const login = (uid?: string, userRole?: UserRole, uName?: string) => {
    setIsAuthenticated(true);
    if (uid) {
      setUserId(uid);
      localStorage.setItem('userId', uid);
    }
    if (uName) {
      setUserName(uName);
      localStorage.setItem('userName', uName);
    }
    const finalRole: UserRole = userRole || (uid && uid.toLowerCase().includes('master')
      ? 'MASTER'
      : (uid && uid.toLowerCase().includes('admin') ? 'ADMIN' : 'USER'));
    setRole(finalRole);
    localStorage.setItem('role', finalRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setUserName(null);
    setRole('USER');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
  };

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const isMaster = String(role).toUpperCase() === 'MASTER';
  const isAdmin = String(role).toUpperCase() === 'ADMIN' || isMaster;

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, userName, role, isMaster, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};