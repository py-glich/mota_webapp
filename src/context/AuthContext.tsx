import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Counter, UserPermissions } from '../types';
import { INITIAL_USERS, INITIAL_COUNTERS } from '../mock/initialData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  currentCounter: Counter;
  counters: Counter[];
  setCurrentUserById: (userId: string) => void;
  setCurrentCounterById: (counterId: string) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => void;
  updateUser: (updatedUser: User) => void;
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateCounterCash: (counterId: string, amountChange: number) => void;
  closeCounterShift: (counterId: string, actualCash: number, notes?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cyberorion_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure cashiers have inner management access
        return parsed.map(u => {
          if (u.role === 'cashier') {
            return {
              ...u,
              permissions: {
                ...u.permissions,
                canViewPurchasePrice: true,
                canViewProfit: true,
                canViewFinancials: true,
                canAdjustStock: true,
                canApproveReturns: true,
                canCashierRegisterCustomers: true,
                canCashierReceivePayments: true,
                canCashierCreateQuotes: true,
                canCashierFlagDamaged: true,
                canCashierCloseShift: true,
              }
            };
          }
          return u;
        });
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('cyberorion_counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('cyberorion_current_user_id') || 'USR-01'; // Default to Owner
  });

  const [currentCounterId, setCurrentCounterId] = useState<string>(() => {
    return localStorage.getItem('cyberorion_current_counter_id') || 'CTR-1'; // Default to Counter 1
  });

  useEffect(() => {
    localStorage.setItem('cyberorion_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cyberorion_counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('cyberorion_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('cyberorion_current_counter_id', currentCounterId);
  }, [currentCounterId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentCounter = counters.find(c => c.id === currentCounterId) || counters[0];

  const setCurrentUserById = (userId: string) => {
    const u = users.find(user => user.id === userId);
    if (u) {
      setCurrentUserId(userId);
      // Auto switch counter if cashier is assigned to a specific counter
      if (u.counterId && (u.counterId === 'CTR-1' || u.counterId === 'CTR-2')) {
        setCurrentCounterId(u.counterId);
      }
    }
  };

  const setCurrentCounterById = (counterId: string) => {
    if (counters.some(c => c.id === counterId)) {
      setCurrentCounterId(counterId);
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (currentUser.role === 'owner' || currentUser.role === 'manager') return true;
    if (currentUser.role === 'cashier') {
      // Cashier can see inner management by default (products, purchases, accounts, reports, etc.)
      if (currentUser.permissions && currentUser.permissions[permission] !== undefined) {
        return !!currentUser.permissions[permission];
      }
      return true;
    }
    return !!currentUser.permissions?.[permission];
  };

  const updateUserPermissions = (userId: string, newPerms: Partial<UserPermissions>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            ...newPerms
          }
        };
      }
      return u;
    }));
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const newId = `USR-${String(users.length + 1).padStart(2, '0')}`;
    const userWithId: User = { ...newUser, id: newId };
    setUsers(prev => [...prev, userWithId]);
  };

  const updateCounterCash = (counterId: string, amountChange: number) => {
    setCounters(prev => prev.map(c => {
      if (c.id === counterId) {
        return {
          ...c,
          currentCash: Math.max(0, c.currentCash + amountChange)
        };
      }
      return c;
    }));
  };

  const closeCounterShift = (counterId: string, actualCash: number, _notes?: string) => {
    setCounters(prev => prev.map(c => {
      if (c.id === counterId) {
        return {
          ...c,
          currentCash: actualCash,
          status: 'closed'
        };
      }
      return c;
    }));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      currentCounter,
      counters,
      setCurrentUserById,
      setCurrentCounterById,
      hasPermission,
      updateUserPermissions,
      updateUser,
      addUser,
      updateCounterCash,
      closeCounterShift
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
