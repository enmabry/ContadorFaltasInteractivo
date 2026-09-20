/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthContextType {
  clientId: string;
  setClientId: (id: string) => void;
  isConfigured: boolean;
}

const STORAGE_KEY = 'google_calendar_client_id';

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  clientId: '',
  setClientId: () => {},
  isConfigured: false
});

export const useGoogleAuth = () => useContext(GoogleAuthContext);

export const GoogleAuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientIdState] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      ''
    );
  });

  const setClientId = (id: string) => {
    const trimmed = id.trim();
    setClientIdState(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isConfigured = Boolean(
    clientId &&
    clientId.includes('.apps.googleusercontent.com') &&
    !clientId.includes('placeholder')
  );

  const effectiveClientId = isConfigured
    ? clientId
    : '100000000000-placeholder.apps.googleusercontent.com';

  return (
    <GoogleAuthContext.Provider value={{ clientId, setClientId, isConfigured }}>
      <GoogleOAuthProvider clientId={effectiveClientId}>
        {children}
      </GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
};
