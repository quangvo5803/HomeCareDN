import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';
import { authService } from '../services/authService';

export default function AvatarMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logout: ctxLogout } = useContext(AuthContext) || {};

  const name = user?.displayName || user?.email || 'User';
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff`;
  const primary = user?.photoURL || user?.avatarUrl || fallback;
  const avatarSrc = imgError ? fallback : primary;

  const handleLogout = () => {
    try {
      authService.logout();
      if (typeof ctxLogout === 'function') ctxLogout();
      navigate('/login', { replace: true });
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:border-blue-500 hover:bg-gray-50 inline-flex items-center justify-center align-middle transition"
        title={t('partnerDashboard.account')}
        aria-label="Account menu"
      >
        <img
          src={avatarSrc}
          onError={() => setImgError(true)}
          alt={name}
          className="w-full h-full object-cover block"
          loading="lazy"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-20">
          <button
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
          >
            👤 {t('header.profile')}
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <i className="fa-solid fa-right-from-bracket text-red-500"></i>{' '}
            {t('header.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
