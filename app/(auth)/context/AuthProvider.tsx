import React, { createContext, useContext, useState, useEffect} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  
} from 'firebase/auth';
//import { doc, setDoc,getDoc,updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, } from '../../config/firebase';
import { User, AuthError, } from '../../types/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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

const saveRouteToMongoDB = async (userId: string, routeId: string) => {
  try {
    const response = await fetch('http://your-server-address:4000/save_route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
      },
      body: JSON.stringify({
        routeName: routeId,
        busId: '' // Add if needed
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving route to MongoDB:', error);
    throw error;
  }
};

const fetchRouteFromMongoDB = async (userId: string) => {
  try {
    const response = await fetch('http://your-server-address:4000/get_routes', {
      headers: {
        'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
      }
    });
    const data = await response.json();
    return data[0]?.routeName || null; // Get most recent route
  } catch (error) {
    console.error('Error fetching route from MongoDB:', error);
    return null;
  }
};
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [selectedRouteId, setSelectedRouteIdState] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>({});



  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async(firebaseUser) => {
    if (firebaseUser) {
      // Get Google provider profile photo if available
      const googleProviderData = firebaseUser.providerData.find(
        (provider) => provider.providerId === 'google.com'
      );
      const photoURL = googleProviderData?.photoURL || firebaseUser.photoURL;

      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
        photoURL,
        emailVerified: firebaseUser.emailVerified,
      };
      setUser(userData);
      try {
        const route = await fetchRouteFromMongoDB(firebaseUser.uid);
        setSelectedRouteIdState(route);
      } catch (err) {
        console.error('Error fetching user route:', err);
        setSelectedRouteIdState(null);
      }
      // Fetch route from Firestore
      // const fetchUserData = async () => {
      //   try {
      //     const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      //     if (userDoc.exists()) {
      //       const data = userDoc.data();
      //       setSelectedRouteIdState(data.route || null);
      //     } else {
      //       setSelectedRouteIdState(null);
      //     }
      //   } catch (err) {
      //     console.error('Error fetching user route:', err);
      //     setSelectedRouteIdState(null);
      //   }};
       // fetchUserData();
    } 
    else {
      setUser(null);
    }
    setIsLoading(false);
    
  });

  return unsubscribe;
}, []);


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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw {
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed',
        };
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      if (!validateEmail(email)) {
        throw {
          code: 'auth/invalid-domain',
          message: 'Only @vitapstudent.ac.in and @vitap.ac.in email domains are allowed',
        };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const firstName = email.split('@')[0].split('.')[0];
      const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // await setDoc(doc(db, 'users', userCredential.user.uid), {
      //   email,
      //   displayName,
      //   createdAt: new Date(),
      //   route: '',
      // });
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
      await signOut(auth);
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

      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      await updateProfile(auth.currentUser, data);

      // const userRef = doc(db, 'users', auth.currentUser.uid);
      // await setDoc(userRef, data, { merge: true });

      setUser(prev => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      setError(parseAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setIsLoading(true);
      clearError();

      if (!uri || typeof uri !== 'string' || !uri.startsWith('file:')) {
        throw new Error(`Invalid image URI: ${uri}`);
      }

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Image blob is empty');
      }
      await auth.currentUser.reload();
const updatedUser = auth.currentUser;

setUser(prev => prev ? {
  ...prev,
  photoURL: updatedUser?.photoURL || ''
} : null);

      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await updateUserProfile({ photoURL: downloadURL });

      return downloadURL;
    } catch (error: any) {
      const parsedError = parseAuthError(error);
      setError(parsedError);
      throw parsedError;
    } finally {
      setIsLoading(false);
    }
  };


const resetPassword = async (email: string) => {
  try {
    setIsLoading(true);
    clearError();
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    setError(parseAuthError(error));
    throw error;
  } finally {
    setIsLoading(false);
  }
};
 // New: setSelectedRouteId function to save route in Firestore and state
  const saveSelectedRouteId = async (routeId: string) => {
    setSelectedRouteIdState(routeId);

    if (!user) return;

    try {
        await saveRouteToMongoDB(user.uid, routeId);
    //setUser(prev => (prev ? { ...prev, route: routeId } : prev);
      // const userRef = doc(db, 'users', user.uid);
      // await setDoc(userRef, { route: routeId }, { merge: true });

      setUser((prev) => (prev ? { ...prev, route: routeId } : prev));
    } catch (err) {
      console.error('Error saving selected route:', err);
    }
  };


  const value = {
    user,
    isLoading,
    login,
    register,
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
