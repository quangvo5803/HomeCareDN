import { useState, useEffect } from 'react';

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import { setNavigate } from './utils/navigateHelper';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

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
import AdminMaterialManager from './pages/admin/AdminMaterialManager';
import AdminMaterialRequestManager from './pages/admin/AdminMaterialRequestManager';
import AdminMaterialRequestDetail from './pages/admin/AdminMaterialRequestDetail';
import AdminServiceRequestManager from './pages/admin/AdminServiceRequestManager';
import AdminServiceRequestDetail from './pages/admin/AdminServiceRequestDetail';
import AdminPartnerRequestManager from './pages/admin/AdminPartnerRequestManager';
import AdminPartnerRequestDetail from './pages/admin/AdminPartnerRequestDetail';
import AdminSupportChatManager from './pages/admin/AdminSupportChatManager';
import AdminUserManager from './pages/admin/AdminUserManager';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminReviewManager from './pages/admin/AdminReviewManager';
import AdminPaymentManager from './pages/admin/AdminPaymentManager';
import AdminNotificationManager from './pages/admin/AdminNotificationManager';
//Contractor pages
import ContractorLayout from './pages/contractor/ContractorLayout';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorServiceRequestManager from './pages/contractor/ContractorServiceRequestManager';
import ContractorServiceRequestDetail from './pages/contractor/ContractorServiceRequestDetail';
//Distributor pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorMaterialRequestManager from './pages/distributor/DistributorMaterialRequestManager';
import DistributorMaterialRequestDetail from './pages/distributor/DistributorMaterialRequestDetail';
import DistributorMaterialManager from './pages/distributor/DistributorMaterialManager';
//Partner pages
import PartnerProfile from './pages/partner/PartnerProfile';
//Home Page
import ItemViewAll from './pages/ItemViewAll';
import MaterialDetail from './pages/MaterialDetail';
import DistributorCategoryManager from './pages/distributor/DistributorCategoryManager';
import ServiceDetail from './pages/ServiceDetail';
import PartnerRegistration from './pages/PartnerRegistration';
import PartnerTypeSelection from './pages/PartnerTypeSelection';

// Customer pages
import CustomerPage from './pages/customer/CustomerPage';
import ServiceRequestCreateUpdate from './pages/customer/ServiceRequestCreateUpdate';
import ServiceRequestDetail from './pages/customer/ServiceRequestDetail';
import MaterialRequestDetail from './pages/customer/MaterialRequestDetail';

import AuthProvider from './context/AuthProvider';
import { useAuth } from './hook/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import DistributorLayout from './pages/distributor/DistributorLayout';
import SupportChatWidget from './components/SupportChatWidget';
function App() {
  const [showBackTop, setShowBackTop] = useState(false);
  const handleBackTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Layout />
        {/* Back to Top */}
        <button
          onClick={handleBackTop}
          aria-label="Back to top"
          className={`fixed bottom-6 right-22 z-50 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg 
                    flex items-center justify-center transition-all duration-300 hover:bg-orange-600  
                    ${showBackTop
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 4l-7 7h5v9h4v-9h5z" />
          </svg>
        </button>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

// Layout: chứa Header, Footer và Routes
function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const noHeaderFooterPaths = [
    '/Login',
    '/Register',
    '/VerifyOTP',
    '/PartnerTypeSelection',
    '/PartnerRegistration',
  ];

  const showHeaderFooter =
    !noHeaderFooterPaths.includes(location.pathname) &&
    (!user ||
      (user.role !== 'Admin' &&
        user.role !== 'Contractor' &&
        user.role !== 'Distributor'));

  const showChatWidget = user?.role !== 'Admin';
  return (
    <>
      <ScrollToTop />
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
          path="/Customer"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerPage />
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
        <Route
          path="/Customer/ServiceRequestDetail/:serviceRequestId"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <ServiceRequestDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Customer/MaterialRequestDetail/:materialRequestId"
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <MaterialRequestDetail />
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
          <Route
            path="ServiceRequestManager"
            element={<AdminServiceRequestManager />}
          />
          <Route
            path="ServiceRequestManager/:serviceRequestId"
            element={<AdminServiceRequestDetail />}
          />
          <Route path="SupportManager" element={<AdminSupportManager />} />
          <Route path="MaterialManager" element={<AdminMaterialManager />} />
          <Route
            path="MaterialRequestManager"
            element={<AdminMaterialRequestManager />}
          />
          <Route
            path="MaterialRequestManager/:materialRequestId"
            element={<AdminMaterialRequestDetail />}
          />
          <Route
            path="PartnerRequestManager"
            element={<AdminPartnerRequestManager />}
          />
          <Route
            path="PartnerRequestManager/:partnerRequestID"
            element={<AdminPartnerRequestDetail />}
          />

          <Route
            path="SupportChatManager"
            element={<AdminSupportChatManager />}
          />
          <Route path="UserManager" element={<AdminUserManager />} />
          <Route path="UserManager/:userID" element={<AdminUserDetail />} />
          <Route path="ReviewManager" element={<AdminReviewManager />} />
          <Route path="PaymentManager" element={<AdminPaymentManager />} />
          <Route path="NotificationManager" element={<AdminNotificationManager />} />
        </Route>
        {/* Contractor routes */}
        <Route
          path="/Contractor"
          element={
            <ProtectedRoute allowedRoles={['Contractor']}>
              <ContractorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ContractorDashboard />} />
          <Route
            path="ServiceRequestManager"
            element={<ContractorServiceRequestManager />}
          />
          <Route
            path="ServiceRequestManager/:serviceRequestId"
            element={<ContractorServiceRequestDetail />}
          />
          <Route path="Profile" element={<PartnerProfile />} />
        </Route>
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
            path="MaterialRequestManager"
            element={<DistributorMaterialRequestManager />}
          />
          <Route
            path="MaterialRequestManager/:materialRequestId"
            element={<DistributorMaterialRequestDetail />}
          />
          <Route
            path="MaterialManager"
            element={<DistributorMaterialManager />}
          />
          <Route
            path="CategoryManager"
            element={<DistributorCategoryManager />}
          />
          <Route path="Profile" element={<PartnerProfile />} />
        </Route>

        {/* Redirect root → /home */}
        <Route
          index
          element={
            <Navigate to={user ? getRedirectPath(user) : '/Home'} replace />
          }
        />
        <Route path="ItemViewAll" element={<ItemViewAll />} />

        {/* Trang thông báo lỗi */}
        <Route path="/Unauthorized" element={<Unauthorized />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showChatWidget && (
        <div className="fixed bottom-6 right-24 z-[60]">
          <SupportChatWidget brand="HomeCareDN" />
        </div>
      )}
      {showHeaderFooter && <Footer />}
    </>
  );
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

export default App;
