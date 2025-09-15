import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import About from './pages/About';
import Contact from './pages/Contact';
import MaterialCatalog from './pages/MaterialCatalog';

//Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBrandManager from './pages/admin/AdminBrandManager';
import AdminCategoryManager from './pages/admin/AdminCategoryManager';
import AdminSupportManager from './pages/admin/AdminSupportManager';
//Contractor pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
//Distributor pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorMaterialManager from './pages/distributor/DistributorMaterialManager';
import DistributorCategoryManager from './pages/distributor/DistributorCategoryManager';

import AuthProvider from './context/AuthProvider';
import { useAuth } from './hook/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import DistributorLayout from './pages/distributor/DistributorLayout';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Layout />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

// Layout: chứa Header, Footer và Routes
function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const noHeaderFooterPaths = ['/Login', '/Register', '/VerifyOTP'];

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
        {/* Home */}
        <Route
          path="/Home"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        {/* About Us */}
        <Route
          path="/About"
          element={
            <PublicRoute>
              <About />
            </PublicRoute>
          }
        />
        {/* Contact Us */}
        <Route
          path="/Contact"
          element={
            <PublicRoute>
              <Contact />
            </PublicRoute>
          }
        />
        <Route
          path="/MaterialCatalog"
          element={
            <PublicRoute>
              <MaterialCatalog />
            </PublicRoute>
          }
        />
        {/* Login */}
        <Route
          path="/Login"
          element={
            !user ? <Login /> : <Navigate to={getRedirectPath(user)} replace />
          }
        />
        {/* Register */}
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
        {/* Verify OTP */}
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
          <Route path="SupportManager" element={<AdminSupportManager />} />
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
          path="/Distributor"
          element={
            <ProtectedRoute allowedRoles={['Distributor']}>
              <DistributorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DistributorDashboard />} />
          <Route
            path="MaterialManager"
            element={<DistributorMaterialManager />}
          />
          <Route
            path="CategoryManager"
            element={<DistributorCategoryManager />}
          />
        </Route>

        {/* Redirect root → /home */}
        <Route
          index
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
      return '/Distributor';
    default:
      return '/Home';
  }
}

export default App;
