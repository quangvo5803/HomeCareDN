import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hook/useAuth';
import Avatar from 'react-avatar';

export default function AvatarMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);

  const handleLogout = () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } finally {
      setOpen(false);
    }
  };

  // Đóng menu khi click ra ngoài hoặc bấm Esc
  useEffect(() => {
    const onClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:border-blue-500 hover:bg-gray-50 inline-flex items-center justify-center align-middle transition"
        title={t('partnerDashboard.account')}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar
          name={user?.email}
          round={true}
          size="100%"
          color="#FB8C00"
          fgColor="#fff"
          textSizeRatio={2}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-20"
        >
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            <i className="fa-solid fa-right-from-bracket text-red-500"></i>{' '}
            {t('header.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
