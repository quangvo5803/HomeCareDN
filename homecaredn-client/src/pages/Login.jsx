import { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import AuthContext from '../context/AuthContext';
import { handleApiError } from '../utils/handleApiError';
import { useTranslation } from 'react-i18next';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { isSafeEmail } from '../utils/validateEmail';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' or 'password'
  const navigate = useNavigate();
  const location = useLocation();
  const { setPendingEmail, login } = useContext(AuthContext);

  const TOAST_ID = useMemo(
    () => ({
      notice: 'notice_once',
      pending: 'pending_once',
      rejected: 'rejected_once',
    }),
    []
  );
  const noticeShownRef = useRef(false);

  const getStatusCodes = (err) => {
    const d = err?.response?.data ?? {};
    const rootUpper = Array.isArray(d.STATUS) ? d.STATUS : [];
    const rootLower = Array.isArray(d.status) ? d.status : [];
    const errs = d.errors || d.Errors || {};
    const modelState = Array.isArray(errs.STATUS) ? errs.STATUS : [];
    return [...rootUpper, ...rootLower, ...modelState];
  };

  useEffect(() => {
    const noticeKey = location.state?.notice;
    if (noticeKey && !noticeShownRef.current) {
      noticeShownRef.current = true;
      toast.info(t(noticeKey), { toastId: TOAST_ID.notice });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.notice, location.pathname, navigate, t, TOAST_ID]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('ERROR.NULL_EMAIL'));
      return;
    }
    if (!isSafeEmail(email)) {
      toast.error(t('ERROR.INVALID_EMAIL'));
      return;
    }

    if (authMethod === 'password' && !password.trim()) {
      toast.error(t('ERROR.NULL_PASSWORD'));
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(
        email,
        authMethod === 'password' ? password : undefined
      );

      if (authMethod === 'password' && response?.data?.accessToken) {
        // Direct password login
        toast.success(t('SUCCESS.LOGIN'));
        login(response.data.accessToken);
      } else {
        // OTP login
        setPendingEmail(email);
        toast.success(t('SUCCESS.SEND_OTP'));
        navigate('/VerifyOTP', { state: { email } });
      }
    } catch (err) {
      const codes = getStatusCodes(err);

      if (codes.includes('PARTNER_PENDING_REVIEW')) {
        if (!toast.isActive(TOAST_ID.pending)) {
          toast.info(t('partner.login.pending_review'), {
            toastId: TOAST_ID.pending,
          });
        }
        return;
      }
      if (codes.includes('PARTNER_REJECTED')) {
        if (!toast.isActive(TOAST_ID.rejected)) {
          toast.info(t('partner.login.rejected'), {
            toastId: TOAST_ID.rejected,
          });
        }
        return;
      }

      if (err.handled) return;
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    window.location.href = '/Register';
  };

  const handlePartnerRegistration = () => {
    navigate('/PartnerTypeSelection');
  };

  if (loading) return <Loading />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Main Login Container */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex relative z-10">
        {/* Left Side - Banner Image */}
        <button
          type="button"
          className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8 cursor-pointer"
          onClick={() => navigate('/Home')}
        >
          <img
            src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
            alt="HomeCareDN Banner"
            className="max-w-full h-auto object-contain transition-transform duration-300 transform hover:scale-105"
          />
        </button>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile Banner */}
            <button
              type="button"
              className="md:hidden text-center mb-8 cursor-pointer p-0 border-0 bg-transparent"
              onClick={() => navigate('/Home')}
            >
              <img
                src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749217489/loginBanner_vsrezl.png"
                alt="HomeCareDN Banner"
                className="max-w-full h-auto object-contain transition-transform duration-300 transform hover:scale-105"
              />
            </button>

            {/* Centered Title and Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {t('login.title')}
              </h2>
              <p className="text-gray-600">{t('login.subtitle')}</p>
            </div>

            {/* Authentication Method Toggle */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMethod('otp')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  authMethod === 'otp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
              >
                OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  authMethod === 'password'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
              >
                {t('login.password') || 'Password'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                  placeholder=" "
                  onFocus={(e) =>
                    e.target.nextElementSibling.classList.add('focused')
                  }
                  onBlur={(e) =>
                    !e.target.value &&
                    e.target.nextElementSibling.classList.remove('focused')
                  }
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    email
                      ? '-top-2 text-xs bg-white px-1 text-blue-600'
                      : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                  }`}
                >
                  {t('login.email_placeholder')}
                </label>
              </div>

              {/* Password Input - Only show when password method is selected */}
              {authMethod === 'password' && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer pr-12"
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      password
                        ? '-top-2 text-xs bg-white px-1 text-blue-600'
                        : 'top-3 text-base text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600'
                    }`}
                  >
                    {t('login.password') || 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  >
                    <i
                      className={`fa-solid ${
                        showPassword ? 'fa-eye-slash' : 'fa-eye'
                      }`}
                    ></i>
                  </button>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!email || (authMethod === 'password' && !password)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {authMethod === 'otp' ? t('BUTTON.SendOTP') : t('BUTTON.Login')}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">
                {t('login.another_login')}
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center mt-4">
              <GoogleLoginButton onLoginSuccess={login} />
            </div>

            {/* Partner Registration Button */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={handlePartnerRegistration}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <i className="fa-solid fa-handshake" aria-hidden="true"></i>
                <span>{t('login.become_partner')}</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-8">
              <span className="text-gray-600">
                {t('login.not_have_account')}
              </span>
              <button
                onClick={handleRegister}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
              >
                {t('login.register_link')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
