import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from './jwtUtils';
import authService from '../services/authService';

const AuthContext = createContext(null);

function extractUser(decoded) {
  return {
    userId: decoded.sub,
    email: decoded.upn || decoded.sub,
    role: decoded.groups ? decoded.groups[0] : null,
    // keep sub for backwards compat
    sub: decoded.sub,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setToken(storedToken);
          setUser(extractUser(decoded));
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const decoded = jwtDecode(data.token);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(extractUser(decoded));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
