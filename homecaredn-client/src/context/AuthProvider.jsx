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

  // 🟢 Listen for session expired event from interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setPendingEmail(null);
      navigate('/Login');
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.warn('Logout API failed:', err);
    } finally {
      authService.clearSession();
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
          setUser(parsed);
          setPendingEmail(null);

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
        }
      } catch (err) {
        toast.error(handleApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [navigate, parseToken]
  );

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

      if (parsed?.exp && parsed.exp > Date.now()) {
        setUser(parsed);
        setLoading(false);
        return;
      }

      // ⚠️ Token hết hạn → thử refresh
      console.log('Token expired, attempting refresh...');
      try {
        const res = await authService.refreshToken();
        const newAccessToken = res.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('accessToken', newAccessToken);
        const newParsed = parseToken(newAccessToken);

        if (newParsed) {
          setUser(newParsed);
        } else {
          throw new Error('Failed to parse new token');
        }
      } catch (err) {
        console.warn('Refresh failed on init:', err);

        authService.clearSession();
        setUser(null);
        setPendingEmail(null);

        navigate('/Login');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [parseToken, navigate]);

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
