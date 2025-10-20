import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
      <h1 className="text-3xl font-bold mb-4">
        {t('ERROR.UNAUTHORIZED_ACCESS')}
      </h1>

      <div
        className="w-full max-w-md h-64 bg-center bg-cover mb-6"
        style={{
          backgroundImage:
            "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
        }}
      />

      <h3 className="text-xl text-gray-800 mb-2">
        {t('ERROR.UNAUTHORIZED_ACCESS')}
      </h3>
      <p className="text-gray-600 mb-4">
        {t('ERROR.UNAUTHORIZED_ACCESS_DESCRIPTION')}
      </p>

      <Link
        to="/"
        className="bg-orange-600 text-white px-5 py-2 rounded-md hover:bg-orange-700 transition"
      >
        {t('BUTTON.BackToHome')}
      </Link>
    </section>
  );
}
