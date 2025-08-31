// src/components/ProtectedRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);

  // Chưa login
  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  // Nếu có roles yêu cầu nhưng user không có quyền
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};
