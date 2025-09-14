// src/components/PublicOnlyRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

export default function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

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
      return '/ContractorDashboard';
    case 'Distributor':
      return '/Distributor';
    default:
      return '/Home';
  }
}
