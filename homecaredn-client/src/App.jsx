import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import About from './pages/About';
import Contact from './pages/Contact';

//Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBrandManager from './pages/admin/AdminBrandManager';
import AdminCategoryManager from './pages/admin/AdminCategoryManager';
//Contractor pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
//Distributor pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';

import AuthProvider from './context/AuthProvider';
import { useAuth } from './hook/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Layout />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

// Layout: chứa Header, Footer và Routes
function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const noHeaderFooterPaths = ['/login', '/register', '/verifyotp'];

  const showHeaderFooter =
    !noHeaderFooterPaths.includes(location.pathname.toLowerCase()) &&
    (!user ||
      (user.role !== 'Admin' &&
        user.role !== 'Contractor' &&
        user.role !== 'Distributor'));

  return (
    <>
      {showHeaderFooter && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route
          path="/Login"
          element={
            !user ? <Login /> : <Navigate to={getRedirectPath(user)} replace />
          }
        />
        <Route
          path="/Register"
          element={
            !user ? (
              <Register />
            ) : (
              <Navigate to={getRedirectPath(user)} replace />
            )
          }
        />
        <Route
          path="/VerifyOTP"
          element={
            !user ? (
              <VerifyOTP />
            ) : (
              <Navigate to={getRedirectPath(user)} replace />
            )
          }
        />

        {/* Admin routes */}
        <Route
          path="/Admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="BrandManager" element={<AdminBrandManager />} />
          <Route path="CategoryManager" element={<AdminCategoryManager />} />
        </Route>

        {/* Contractor routes */}
        <Route
          path="/ContractorDashboard"
          element={
            <ProtectedRoute allowedRoles={['Contractor']}>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        {/* Distributor routes */}
        <Route
          path="/DistributorDashboard"
          element={
            <ProtectedRoute allowedRoles={['Distributor']}>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        {/* Redirect root → /home */}
        <Route
          path="/"
          element={
            <Navigate to={user ? getRedirectPath(user) : '/Home'} replace />
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={user ? getRedirectPath(user) : '/Home'} replace />
          }
        />
      </Routes>
      {showHeaderFooter && <Footer />}
    </>
  );
}
function getRedirectPath(user) {
  switch (user?.role) {
    case 'Admin':
      return '/Admin';
    case 'Contractor':
      return '/ContractorDashboard';
    case 'Distributor':
      return '/DistributorDashboard';
    default:
      return '/Home';
  }
}

export default App;
