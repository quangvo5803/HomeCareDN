import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './configs/i18n';

import AuthProvider from './context/AuthProvider.jsx';
import { AddressProvider } from './context/AddressProvider.jsx';
import { BrandProvider } from './context/BrandProvider.jsx';
import { CategoryProvider } from './context/CategoryProvider.jsx';
import { MaterialProvider } from './context/MaterialProvider.jsx';
import { ServiceProvider } from './context/ServiceProvider.jsx';
import { ServiceRequestProvider } from './context/ServiceRequestProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AddressProvider>
          <BrandProvider>
            <CategoryProvider>
              <MaterialProvider>
                <ServiceProvider>
                  <ServiceRequestProvider>
                    <App />
                  </ServiceRequestProvider>
                </ServiceProvider>
              </MaterialProvider>
            </CategoryProvider>
          </BrandProvider>
        </AddressProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
