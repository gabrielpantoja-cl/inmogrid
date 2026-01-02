// __tests__/__mocks__/providers/google-provider.ts
import GoogleProvider from 'next-auth/providers/google';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React, { ReactNode, FC } from 'react';

// Tipos
interface GoogleProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  picture: string;
}

interface GoogleResponse {
  accessToken: string;
  refreshToken: string;
  profile: GoogleProfile;
}

interface ProviderOptions {
  clientId: string;
  clientSecret: string;
}

interface ProvidersWrapperProps {
  children: ReactNode;
}

// Constantes
export const MOCK_GOOGLE_ID = 'mock-google-id';
export const MOCK_GOOGLE_SECRET = 'mock-google-secret';

// Mocks de datos
export const mockGoogleProfile: GoogleProfile = {
  sub: '123456789',
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  email: 'test@example.com',
  email_verified: true,
  picture: 'https://example.com/picture.jpg',
};

export const mockGoogleResponse: GoogleResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  profile: mockGoogleProfile,
};

// Provider de Google
export const mockGoogleProvider: any = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code'
    }
  },
  clientId: MOCK_GOOGLE_ID,
  clientSecret: MOCK_GOOGLE_SECRET,
  idToken: true,
  checks: ['pkce', 'state'],
  profile: (profile: GoogleProfile) => ({
    id: profile.sub,
    name: profile.name,
    email: profile.email,
    image: profile.picture,
  }),
};

// Mock de callback
export const mockGoogleCallback = jest.fn().mockImplementation(
  async (): Promise<GoogleResponse> => mockGoogleResponse
);

// Provider completo
export const googleProviderMock = {
  ...mockGoogleProvider,
  credentials: undefined,
  options: {
    clientId: MOCK_GOOGLE_ID,
    clientSecret: MOCK_GOOGLE_SECRET,
  } as ProviderOptions,
  callback: mockGoogleCallback,
};

// Session mock
export const mockSession: Session = {
  user: {
    id: mockGoogleProfile.sub,
    name: mockGoogleProfile.name,
    email: mockGoogleProfile.email,
    image: mockGoogleProfile.picture,
    role: 'user',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};



export type { ProvidersWrapperProps };
export default googleProviderMock;