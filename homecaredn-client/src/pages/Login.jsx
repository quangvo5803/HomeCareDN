import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import AuthContext from '../context/AuthContext';
import { handleApiError } from '../utils/handleApiError';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setPendingEmail, login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('ERROR.NULL_EMAIL'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error(t('ERROR.INVALID_EMAIL'));
      return;
    }

    setLoading(true);
    try {
      await authService.login(email);
      setPendingEmail(email);
      toast.success(t('SUCCESS.SEND_OTP'));
      navigate('/VerifyOTP', { state: { email } });
    } catch (err) {
      if (err.handled) return;
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    window.location.href = '/Register';
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

            <div className="space-y-6">
              {/* Floating Label Input */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-transparent peer"
                  placeholder="Email"
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

              <button
                onClick={handleLogin}
                disabled={!email}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {t('BUTTON.SendOTP')}
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
              <GoogleLogin
                locale={i18n.language === 'vi' ? 'vi' : 'en'}
                onSuccess={async (credentialResponse) => {
                  try {
                    const credential = credentialResponse.credential;
                    const res = await authService.googleLogin(credential);

                    if (res.data?.accessToken) {
                      login(res.data.accessToken);
                      toast.success(t('SUCCESS.LOGIN'));
                    }
                  } catch {
                    toast.error(t('ERROR.LOGIN_GOOGLE'));
                  }
                }}
                onError={() => {
                  toast.error(t('ERROR.LOGIN_GOOGLE'));
                }}
              />
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
