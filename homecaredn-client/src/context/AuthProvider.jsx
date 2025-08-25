// AuthProvider.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';
import { authService } from '../services/authService';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);
  const refreshTimeoutRef = useRef(null);

  const parseToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        token,
        id:
          decoded.sub ||
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ],
        role:
          decoded.role ||
          decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ],
        email:
          decoded.email ||
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
          ] ||
          '',
        exp: decoded.exp ? decoded.exp * 1000 : null,
      };
    } catch {
      return null;
    }
  }, []);
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setPendingEmail(null);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
  }, []);
  const scheduleRefresh = useCallback(
    (exp) => {
      if (!exp) return;
      const now = Date.now();
      const timeout = exp - now - (30 + Math.floor(Math.random() * 10)) * 1000; // refresh trước 30-39s
      if (timeout <= 0) return;

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await authService.refreshToken();
          if (res.data?.accessToken) {
            localStorage.setItem('accessToken', res.data.accessToken);
            const parsed = parseToken(res.data.accessToken);
            if (parsed) setUser(parsed);
          }
        } catch {
          logout();
        }
      }, timeout);
    },
    [parseToken, logout]
  );
  const login = useCallback(
    (token) => {
      localStorage.setItem('accessToken', token);
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
        setPendingEmail(null);
        scheduleRefresh(parsed.exp);
        if (parsed.role === 'Admin') navigate('/AdminDashboard');
        else if (parsed.role === 'Contractor') navigate('/ContractorDashboard');
        else if (parsed.role === 'Distributor')
          navigate('/DistributorDashboard');
        else navigate('/');
      }
    },
    [navigate, parseToken, scheduleRefresh]
  );

  // Load token khi F5
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
        scheduleRefresh(parsed.exp);
      } else logout();
    }
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [parseToken, logout, scheduleRefresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        pendingEmail,
        setPendingEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
