import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './configs/i18n';

import AuthProvider from './context/AuthProvider.jsx';
import { ProfileProvider } from './context/ProfileProvider.jsx';
import { AddressProvider } from './context/AddressProvider.jsx';
import { BrandProvider } from './context/BrandProvider.jsx';
import { CategoryProvider } from './context/CategoryProvider.jsx';
import { MaterialProvider } from './context/MaterialProvider.jsx';
import { ServiceProvider } from './context/ServiceProvider.jsx';
import { PartnerRequestProvider } from './context/PartnerRequestProvider.jsx';
import { ServiceRequestProvider } from './context/ServiceRequestProvider.jsx';
import { MaterialRequestProvider } from './context/MaterialRequestProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <AddressProvider>
            <BrandProvider>
              <CategoryProvider>
                <MaterialProvider>
                  <ServiceProvider>
                    <PartnerRequestProvider>
                      <ServiceRequestProvider>
                        <MaterialRequestProvider>
                          <App />
                        </MaterialRequestProvider>
                      </ServiceRequestProvider>
                    </PartnerRequestProvider>
                  </ServiceProvider>
                </MaterialProvider>
              </CategoryProvider>
            </BrandProvider>
          </AddressProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
