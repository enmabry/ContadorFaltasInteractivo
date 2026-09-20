/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthContextType {
  clientId: string;
  setClientId: (id: string) => void;
  isConfigured: boolean;
}

const STORAGE_KEY = 'google_calendar_client_id';
const DEFAULT_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '324877115560-jjord55tu35fakiqluocqm15triicbs7.apps.googleusercontent.com';

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  clientId: DEFAULT_CLIENT_ID,
  setClientId: () => {},
  isConfigured: true
});

export const useGoogleAuth = () => useContext(GoogleAuthContext);

export const GoogleAuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientIdState] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      DEFAULT_CLIENT_ID
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

  const effectiveClientId = isConfigured ? clientId : DEFAULT_CLIENT_ID;

  return (
    <GoogleAuthContext.Provider value={{ clientId, setClientId, isConfigured }}>
      <GoogleOAuthProvider clientId={effectiveClientId}>
        {children}
      </GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
};
