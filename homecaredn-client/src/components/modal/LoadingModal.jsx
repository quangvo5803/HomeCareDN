// src/components/LoadingInline.jsx
import React from 'react';

export default function LoadingModal() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-64">
      <i
        className="fa-solid fa-building fa-flip mb-6"
        style={{ color: '#FDA12B', fontSize: '48px' }}
      ></i>
    </div>
  );
}
