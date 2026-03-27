import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const existing = getCurrentUser();
    const token = localStorage.getItem('token');
    if (existing && token) {
      setUser({ id: existing?.id || existing?._id, name: existing?.name, email: existing?.email });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiRequest<any>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      const token = res?.data?.token;
      const u = res?.data?.user;

      const allowedSchoolIds: unknown = u?.allowedSchoolIds;
      const derivedSchoolId = Array.isArray(allowedSchoolIds) && allowedSchoolIds.length > 0
        ? String(allowedSchoolIds[0] || '').trim()
        : '';

      if (!token || !u) return false;
      if (u?.role && String(u.role) !== 'student') return false;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));

      if (derivedSchoolId) {
        localStorage.setItem('schoolId', derivedSchoolId);
      }

      setUser({ id: String(u.id || u._id || ''), name: u.name, email: u.email });
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // No signup endpoint in gateway for now
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('schoolId');
    setUser(null);
  };

  const isAuthenticated = useMemo(() => !!user && !!localStorage.getItem('token'), [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
