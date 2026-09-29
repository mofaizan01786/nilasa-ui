"use client";

import React, { createContext, useContext } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleAuthContextType {
  isAvailable: boolean;
  clientId: string;
}

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  isAvailable: false,
  clientId: ""
});

export const useGoogleAuth = () => useContext(GoogleAuthContext);

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
  clientId?: string;
}

export function GoogleOAuthWrapper({ children, clientId }: GoogleOAuthWrapperProps) {
  const effectiveClientId = (clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  const isAvailable = Boolean(effectiveClientId);

  if (!isAvailable) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[GoogleOAuthWrapper] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google Sign-In is disabled."
      );
    }

    return (
      <GoogleAuthContext.Provider value={{ isAvailable: false, clientId: "" }}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={effectiveClientId}>
      <GoogleAuthContext.Provider value={{ isAvailable: true, clientId: effectiveClientId }}>
        {children}
      </GoogleAuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

