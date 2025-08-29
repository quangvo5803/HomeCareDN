// src/components/Loading.jsx
import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <i
        className="fa-solid fa-building fa-flip"
        style={{ color: '#FDA12B', fontSize: '48px' }}
      ></i>
    </div>
  );
};

export default Loading;
