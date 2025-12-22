// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import PropTypes from 'prop-types';
import Loading from '../components/Loading';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // ⏳ Chờ auth ổn định
  if (loading) return <Loading />;

  // 🚪 Chưa login
  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  // 📝 Partner chưa confirm
  if (
    (user.role === 'Contractor' || user.role === 'Distributor') &&
    user.isPartnerComfirm === false
  ) {
    return <Navigate to="/Signature" replace />;
  }

  // ⛔ Sai role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/Unauthorized" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
