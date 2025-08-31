import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loading from '../components/Loading';
import { handleApiError } from '../utils/handleApiError';
import { useTranslation } from 'react-i18next';

export default function VerifyOTP() {
  const [t] = useTranslation();
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { login, pendingEmail } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const email = pendingEmail || location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!email) {
      toast.error(t('ERROR.NOT_FOUND_EMAIL'));
      navigate('/Login', { replace: true });
    }
  }, [email, navigate, t]);

  const handleLogin = async () => {
    if (!otp.trim()) return toast.error(t('ERROR.NULL_OTP'));
    setLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp);
      toast.success(t('SUCCESS.LOGIN'));
      login(response.data.accessToken);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login'); // quay về login
  };

  const handleResendOtp = async () => {
    if (!email) return toast.error(t('ERROR.NOT_FOUND_EMAIL'));
    try {
      await authService.resendOtp(email);
      toast.success(t('SUCCESS.SEND_OTP'));
    } catch (err) {
      if (err.handled) return;
      toast.error(handleApiError(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/dl4idg6ey/image/upload/v1749267431/loginBg_q3gjez.png)',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          {/* Logo */}
          <button
            onClick={() => navigate('/Home')}
            className="p-0 border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
            aria-label="Go to Home"
          >
            <img
              src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
              alt="HomeCareOn"
              className="h-16 mx-auto mb-4 transition-transform duration-300 transform hover:scale-110"
            />
          </button>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            {t('verifyotp.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-center mb-8">
            {t('verifyotp.subtitle')}{' '}
            <span className="font-medium">{email}</span>
          </p>

          {/* OTP Form */}
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <input
                type="text"
                placeholder={t('verifyotp.otp_placeholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength="6"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={!otp.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {t('BUTTON.Login')}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {t('BUTTON.BackToLogin')}
              </button>
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              {t('verifyotp.not_receive_otp')}{' '}
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t('verifyotp.resend_otp')}
                </button>
              ) : (
                <span className="font-medium text-gray-800">
                  {t('verifyotp.resend_in')} {timeLeft}s
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
