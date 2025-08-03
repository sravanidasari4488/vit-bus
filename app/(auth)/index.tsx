import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from './context/AuthProvider';

export default function AuthIndex() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isUserApproved, isPending, isRejected } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (isAuthenticated && user) {
    // Check approval status
    if (isUserApproved()) {
      return <Redirect href="/(tabs)" />;
    } else if (isPending() || isRejected()) {
      return <Redirect href="/pending-approval" />;
    }
  }

  return <Redirect href="/login" />;
}
