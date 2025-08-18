// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);

  // Parse JWT token
  const parseToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
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

  // Đăng nhập
  const login = useCallback(
    (token) => {
      localStorage.setItem('accessToken', token);
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
        setPendingEmail(null);
        if (parsed.role === 'Admin') {
          navigate('/AdminDashboard');
        } else if (parsed.role === 'Contractor') {
          navigate('/ContractorDashboard');
        } else if (parsed.role === 'Distributor') {
          navigate('/DistributorDashboard');
        } else {
          navigate('/');
        }
      }
    },
    [navigate, parseToken]
  );

  // Đăng xuất
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setPendingEmail(null);
    authService.logout();
    navigate('/Login');
  }, [navigate]);

  // Load token từ localStorage khi F5
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
