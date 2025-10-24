// src/components/PublicOnlyRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import PropTypes from 'prop-types';
import Loading from '../components/Loading';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;

  if (!user) {
    return children;
  }

  if (user.role === 'Customer') {
    return children;
  }

  return <Navigate to={getRedirectPath(user)} replace />;
}

function getRedirectPath(user) {
  switch (user?.role) {
    case 'Admin':
      return '/Admin';
    case 'Contractor':
      return '/Contractor';
    case 'Distributor':
      return '/Distributor';
    default:
      return '/Home';
  }
}
PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
