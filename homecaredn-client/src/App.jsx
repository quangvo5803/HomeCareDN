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
import AdminServiceManager from './pages/admin/AdminServiceManager';
import AdminSupportManager from './pages/admin/AdminSupportManager';
import AdminPartnerManager from './pages/admin/AdminPartnerManager';
//Contractor pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
//Distributor pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorMaterialManager from './pages/distributor/DistributorMaterialManager';
//Home Page
import MaterialViewAll from './pages/MaterialViewAll';
import MaterialDetail from './pages/MaterialDetail';
import DistributorCategoryManager from './pages/distributor/DistributorCategoryManager';
import ServiceDetail from './pages/ServiceDetail';
import PartnerRegistration from './pages/PartnerRegistration';
import PartnerTypeSelection from './pages/PartnerTypeSelection';
import RepairViewAll from './pages/RepairViewAll';
import ConstructionViewAll from './pages/ConstructionViewAll';
// Customer pages
import Profile from './pages/customer/Profile';
import ServiceRequestCreateUpdate from './pages/customer/ServiceRequestCreateUpdate';

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
  const noHeaderFooterPaths = ['/Login', '/Register', '/VerifyOTP','/PartnerTypeSelection','/PartnerRegistration'];

  const showHeaderFooter =
    !noHeaderFooterPaths.includes(location.pathname) &&
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
          path="/MaterialDetail/:materialID"
          element={
            <PublicRoute>
              <MaterialDetail />
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
        <Route
          path="/ServiceDetail/:serviceID"
          element={
            <PublicRoute>
              <ServiceDetail />
            </PublicRoute>
          }
        />
        <Route
          path="/PartnerRegistration"
          element={
            user ? (
              <Navigate to={getRedirectPath(user)} replace />
          ) : (
              <PartnerRegistration />
            )
          }
        />

        {/* PartnerTypeSelection */}
        <Route
          path="/PartnerTypeSelection"
          element={
            user ? (
              <Navigate to={getRedirectPath(user)} replace />
            ) : (
               <PartnerTypeSelection />
            )
          }
        />
        {/* Login */}
        <Route
          path="/Login"
          element={
            user ? <Navigate to={getRedirectPath(user)} replace /> : <Login />
          }
        />
        {/* Register */}
        <Route
          path="/Register"
          element={
            user ? (
              <Navigate to={getRedirectPath(user)} replace />
            ) : (
              <Register />
            )
          }
        />
        {/* Verify OTP */}
        <Route
          path="/VerifyOTP"
          element={
            user ? (
              <Navigate to={getRedirectPath(user)} replace />
            ) : (
              <VerifyOTP />
            )
          }
        />
        {/* Customer routes */}
        <Route
          path="/Customer/Profile"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <Profile />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/Customer/ServiceRequest"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <ServiceRequestCreateUpdate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Customer/ServiceRequest/:serviceRequestId"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <ServiceRequestCreateUpdate />
            </ProtectedRoute>
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
          <Route path="ServiceManager" element={<AdminServiceManager />} />
          <Route path="SupportManager" element={<AdminSupportManager />} />
          <Route path="PartnerManager" element={<AdminPartnerManager />} />
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
        <Route path="MaterialViewAll" element={<MaterialViewAll />} />
        <Route path="RepairViewAll" element={<RepairViewAll />} />
        <Route path="ConstructionViewAll" element={<ConstructionViewAll />} />

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
