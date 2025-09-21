// src/components/Loading.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const Loading = ({ progress }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white p-4">
      <i
        className="fa-solid fa-building fa-flip mb-6"
        style={{ color: '#FDA12B', fontSize: '48px' }}
      ></i>

      {progress > 0 && (
        <div className="w-full max-w-md">
          {/* Progress Bar Container */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-200"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <p className="mt-3 text-center text-gray-700 font-medium">
            {t('toast.uploadLogo', { percent: progress })}
          </p>
        </div>
      )}
    </div>
  );
};
Loading.propTypes = {
  progress: PropTypes.number.isRequired,
};
export default Loading;
