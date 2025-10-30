import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import PropTypes from 'prop-types';

export default function GoogleLoginButton({ onLoginSuccess }) {
  const { t, i18n } = useTranslation();

  const handleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const res = await authService.googleLogin(credential);

      if (res.data?.accessToken) {
        onLoginSuccess(res.data.accessToken);
        toast.success(t('SUCCESS.LOGIN'));
      }
    } catch {
      toast.error(t('ERROR.LOGIN_GOOGLE'));
    }
  };

  return (
    <GoogleLogin
      locale={i18n.language === 'vi' ? 'vi' : 'en'}
      onSuccess={handleSuccess}
      onError={() => toast.error(t('ERROR.LOGIN_GOOGLE'))}
    />
  );
}
GoogleLoginButton.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};
