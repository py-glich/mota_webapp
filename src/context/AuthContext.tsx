import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Counter, UserPermissions, Role } from '../types';
import { INITIAL_USERS, INITIAL_COUNTERS } from '../mock/initialData';

export interface RegisterData {
  name: string;
  username: string;
  email?: string;
  password: string;
  role?: Role;
  counterId?: string;
  phone?: string;
  avatar?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  currentUser: User;
  users: User[];
  currentCounter: Counter;
  counters: Counter[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<{ success: boolean; message?: string }>;
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

  // Track authenticated user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedAuth = localStorage.getItem('cyberorion_auth_user');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch (e) {
        console.error(e);
      }
    }
    return users[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cyberorion_is_authenticated') === 'true';
  });

  const [currentCounterId, setCurrentCounterId] = useState<string>(() => {
    return localStorage.getItem('cyberorion_current_counter_id') || 'CTR-1';
  });

  // Sync to storage
  useEffect(() => {
    localStorage.setItem('cyberorion_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cyberorion_counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cyberorion_auth_user', JSON.stringify(currentUser));
      localStorage.setItem('cyberorion_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cyberorion_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('cyberorion_current_counter_id', currentCounterId);
  }, [currentCounterId]);

  const currentCounter = counters.find(c => c.id === currentCounterId) || counters[0];

  // Login handler
  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        if (data.user.counterId && (data.user.counterId === 'CTR-1' || data.user.counterId === 'CTR-2')) {
          setCurrentCounterId(data.user.counterId);
        }
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      // Local fallback for offline mode
      const query = username.trim().toLowerCase();
      const localUser = users.find(u => 
        u.username.toLowerCase() === query || 
        (u.email && u.email.toLowerCase() === query)
      );

      if (!localUser) {
        return { success: false, message: 'Account not found in local database.' };
      }

      const validPass = localUser.password ? localUser.password === password.trim() : (password.trim() === 'password123' || password.trim() === '123456');
      if (!validPass) {
        return { success: false, message: 'Incorrect password.' };
      }

      setCurrentUser(localUser);
      setIsAuthenticated(true);
      return { success: true };
    }
  };

  // Register handler
  const register = async (regData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers(prev => [data.user, ...prev]);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        if (data.user.counterId && (data.user.counterId === 'CTR-1' || data.user.counterId === 'CTR-2')) {
          setCurrentCounterId(data.user.counterId);
        }
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      // Offline fallback
      const cleanUsername = regData.username.trim().toLowerCase();
      const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
      if (existing) {
        return { success: false, message: 'Username is already taken.' };
      }

      const defaultRole = regData.role || 'cashier';
      const newUser: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: regData.name.trim(),
        username: cleanUsername,
        email: regData.email?.trim() || `${cleanUsername}@motopro.local`,
        password: regData.password.trim(),
        role: defaultRole,
        counterId: regData.counterId || (defaultRole === 'cashier' ? 'CTR-1' : undefined),
        active: true,
        phone: regData.phone || '+92 300 0000000',
        avatar: regData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
        permissions: {
          canViewPurchasePrice: true,
          canViewProfit: true,
          canOverridePrice: defaultRole !== 'storekeeper',
          canApplyCustomDiscount: defaultRole !== 'storekeeper',
          maxDiscountPercent: defaultRole === 'owner' ? 50 : 25,
          canVoidInvoice: defaultRole !== 'storekeeper',
          canEditInvoice: true,
          canAdjustStock: true,
          canViewFinancials: true,
          canManageUsers: defaultRole === 'owner',
          canManageBackups: defaultRole === 'owner',
          canApproveReturns: true,
          canCashierRegisterCustomers: true,
          canCashierReceivePayments: true,
          canCashierCreateQuotes: true,
          canCashierFlagDamaged: true,
          canCashierCloseShift: true,
        }
      };

      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    }
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cyberorion_is_authenticated');
  };

  // Profile update handler
  const updateProfile = async (profData: ProfileUpdateData): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...profData })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setUsers(prev => prev.map(u => u.id === data.user.id ? data.user : u));
        return { success: true };
      }
      return { success: false, message: data.message || 'Profile update failed' };
    } catch (err: any) {
      // Local fallback
      if (profData.newPassword) {
        const userPass = currentUser.password || 'password123';
        if (profData.currentPassword && profData.currentPassword !== userPass) {
          return { success: false, message: 'Current password does not match.' };
        }
      }

      const updated: User = {
        ...currentUser,
        name: profData.name || currentUser.name,
        email: profData.email || currentUser.email,
        phone: profData.phone || currentUser.phone,
        avatar: profData.avatar || currentUser.avatar,
        password: profData.newPassword || currentUser.password
      };

      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      return { success: true };
    }
  };

  const setCurrentUserById = (userId: string) => {
    const u = users.find(user => user.id === userId);
    if (u) {
      setCurrentUser(u);
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
    if (!currentUser) return false;
    if (currentUser.role === 'owner' || currentUser.role === 'manager') return true;
    if (currentUser.role === 'cashier') {
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
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
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
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
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
