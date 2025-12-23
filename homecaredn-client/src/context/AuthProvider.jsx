import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from './AuthContext';
import { authService } from '../services/authService';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/handleApiError';

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [loading, setLoading] = useState(true);

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
        isPartnerComfirm:
          decoded.IsPartnerComfirm === 'True' ||
          decoded.IsPartnerComfirm === true,
        exp: decoded.exp ? decoded.exp * 1000 : null,
      };
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setPendingEmail(null);
      navigate('/Login');
      setLoading(false);
    }
  }, [navigate]);

  const login = useCallback(
    async (token) => {
      setLoading(true);
      try {
        localStorage.setItem('accessToken', token);
        const parsed = parseToken(token);
        if (parsed) {
          // ✅ CRITICAL FIX: Set user FIRST
          setUser(parsed);
          setPendingEmail(null);

          // ✅ Wait for state to update before navigation
          setTimeout(() => {
            // Điều hướng theo role
            switch (parsed.role) {
              case 'Admin':
                navigate('/AdminDashboard');
                break;
              case 'Contractor':
                navigate('/Contractor');
                break;
              case 'Distributor':
                navigate('/DistributorDashboard');
                break;
              default:
                navigate('/');
            }
            setLoading(false);
          }, 100);
        } else {
          setLoading(false);
        }
      } catch (err) {
        toast.error(handleApiError(err));
        setLoading(false);
      }
    },
    [navigate, parseToken]
  );

  // ✅ Listen for force logout event from API interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setPendingEmail(null);
      setLoading(false);
    };

    window.addEventListener('auth:force-logout', handleForceLogout);

    return () => {
      window.removeEventListener('auth:force-logout', handleForceLogout);
    };
  }, []);

  // 🟢 Khi F5 hoặc mở lại tab → kiểm tra token, nếu hết hạn thì tự refresh
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const parsed = parseToken(token);

      // Nếu token còn hạn → set user bình thường
      if (parsed?.exp && parsed.exp > Date.now()) {
        setUser(parsed);
        setLoading(false);
        return;
      }

      // Nếu token hết hạn → thử refresh
      try {
        const res = await authService.refreshToken();
        const newAccessToken = res.data?.accessToken;

        if (!newAccessToken) throw new Error('No token');

        localStorage.setItem('accessToken', newAccessToken);
        const newParsed = parseToken(newAccessToken);
        setUser(newParsed);
      } catch {
        console.warn('Refresh failed, clearing user');
        // ✅ Nếu refresh fail thì clear user luôn
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [parseToken]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      pendingEmail,
      setPendingEmail,
      loading,
    }),
    [user, login, logout, pendingEmail, setPendingEmail, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
