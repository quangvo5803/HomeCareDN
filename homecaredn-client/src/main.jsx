import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './configs/i18n';

import AuthProvider from './context/AuthProvider.jsx';
import { BrandProvider } from './context/BrandProvider.jsx';
import { CategoryProvider } from './context/CategoryProvider.jsx';
import { MaterialProvider } from './context/MaterialProvider.jsx';
import { ServiceProvider } from './context/ServiceProvider.jsx';
import { PartnerProvider } from './context/PartnerProvider.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BrandProvider>
          <CategoryProvider>
            <MaterialProvider>
              <ServiceProvider>
                <PartnerProvider>
                <App />
                </PartnerProvider>
              </ServiceProvider>
            </MaterialProvider>
          </CategoryProvider>
        </BrandProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
