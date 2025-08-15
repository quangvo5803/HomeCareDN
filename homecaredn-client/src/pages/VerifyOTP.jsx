import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';

export default function VerifyOTP() {
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!otp.trim()) {
      console.log('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success('Đăng nhập thành công');
    } catch (err) {
      let message =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra, vui lòng thử lại';

      // Nếu có errors, lấy thông báo đầu tiên
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        message = errors[firstErrorKey][0] || message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    console.log('Quay lại trang đăng nhập');
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
            We have sent a verification code to {'{Email}'}
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
              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Login
              </button>

              {/* Back to Login Button */}
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
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
