import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthError {
  code: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<string>;
  error: AuthError | null;
  clearError: () => void;
  selectedRouteId: string | null;
  setSelectedRouteId: (routeId: string) => Promise<void>;
  userInfo: any;
  setUserInfo: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signIn, signUp, signOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [selectedRouteId, setSelectedRouteIdState] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>({});

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        const userData: User = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          displayName: clerkUser.fullName || clerkUser.firstName || null,
          photoURL: clerkUser.imageUrl || null,
          emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        };
        setUser(userData);
        loadUserRoute();
      } else {
        setUser(null);
        setSelectedRouteIdState(null);
      }
      setIsLoading(false);
    }
  }, [clerkUser, isLoaded]);

  const loadUserRoute = async () => {
    try {
      const route = await AsyncStorage.getItem('selectedRoute');
      setSelectedRouteIdState(route);
    } catch (err) {
      console.error('Error loading user route:', err);
      setSelectedRouteIdState(null);
    }
  };

  const parseAuthError = (error: any): AuthError => ({
    code: error.code || 'unknown',
    message: error.message || 'An unknown error occurred',
  });

  const clearError = () => {
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const validDomains = ['@vitapstudent.ac.in', '@vitap.ac.in'];
    return validDomains.some(domain => email.endsWith(domain));
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw {
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed',
        };
      }

      await signIn?.create({
        identifier: email,
        password,
      });
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw {
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed',
        };
      }

      const firstName = email.split('@')[0].split('.')[0];
      const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      const result = await signUp?.create({
        emailAddress: email,
        password,
        firstName: displayName,
      });

      if (result) {
        // Send verification email
        await result.prepareEmailAddressVerification({ strategy: 'email_link' });
      }
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      clearError();
      await signOut?.();
      setUser(null);
      setSelectedRouteIdState(null);
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      setIsLoading(true);
      clearError();

      if (!clerkUser) {
        throw new Error('No authenticated user');
      }

      if (data.displayName) {
        await clerkUser.update({
          firstName: data.displayName,
        });
      }

      if (data.photoURL) {
        await clerkUser.setProfileImage({ file: data.photoURL });
      }

      setUser(prev => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!clerkUser) {
      throw new Error('No authenticated user');
    }

    try {
      setIsLoading(true);
      clearError();

      if (!uri || typeof uri !== 'string' || !uri.startsWith('file:')) {
        throw new Error(`Invalid image URI: ${uri}`);
      }

      await clerkUser.setProfileImage({ file: uri });
      
      // Get updated user data
      await clerkUser.reload();
      const updatedImageUrl = clerkUser.imageUrl;

      setUser(prev => prev ? {
        ...prev,
        photoURL: updatedImageUrl || ''
      } : null);

      return updatedImageUrl || '';
    } catch (error: any) {
      const parsedError = parseAuthError(error);
      setError(parsedError);
      throw parsedError;
    } finally {
      setIsLoading(false);
    }
  };

  const saveSelectedRouteId = async (routeId: string) => {
    setSelectedRouteIdState(routeId);

    try {
      await AsyncStorage.setItem('selectedRoute', routeId);
    } catch (err) {
      console.error('Error saving selected route:', err);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    uploadProfileImage,
    error,
    clearError,
    userInfo,
    setUserInfo,
    selectedRouteId,
    setSelectedRouteId: saveSelectedRouteId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthProvider;