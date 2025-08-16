import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loading from '../components/Loading';

export default function VerifyOTP() {
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!otp.trim()) return toast.error('Vui lòng nhập mã OTP');
    setLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp);
      toast.success('Đăng nhập thành công');
      login(response.data.accessToken);
    } catch (err) {
      let message =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        message = errors[firstKey][0] || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login'); // quay về login
  };

  const handleResendOtp = async () => {
    if (!email) return toast.error('Không tìm thấy email');
    try {
      await authService.resendOtp(email);
      toast.success('Đã gửi lại mã OTP, vui lòng kiểm tra email');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Không thể gửi lại OTP, thử lại sau'
      );
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
      >
        {/* Blue overlay */}
        <div className="absolute inset-0 bg-blue-600 bg-opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="https://res.cloudinary.com/dl4idg6ey/image/upload/v1749183824/logo_flxixf.png"
              alt="HomeCareOn"
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Verify OTP
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-center mb-8">
            We have sent a verification code to{' '}
            <span className="font-medium">{email}</span>
          </p>

          {/* OTP Form */}
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <input
                type="text"
                placeholder="Enter OTP"
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
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Login
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Login Page
              </button>
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOtp}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
