import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { authService } from '../services/authService';
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const parseToken = useCallback((token) => {
    try {
      const decoded = jwt_decode(token);
      return {
        token,
        role:
          decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] || decoded.role,
        id:
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ] ||
          decoded.sub ||
          decoded.id,
        email:
          decoded.email ||
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
          ] ||
          '',
      };
    } catch {
      return null;
    }
  }, []);

  const login = useCallback(
    (token) => {
      localStorage.setItem('accessToken', token);
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
        if (parsed.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    },
    [navigate, parseToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    authService.logout();
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
      } else {
        logout();
      }
    }
  }, [parseToken, logout]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
