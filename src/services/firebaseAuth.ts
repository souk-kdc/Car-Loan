import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User,
  Auth
} from 'firebase/auth';
import rawFirebaseConfig from '../../firebase-applet-config.json';

const firebaseConfig = rawFirebaseConfig || {};

// Initialize Firebase App instance safely
let app: any = null;
let authInstance: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

try {
  if (firebaseConfig && (firebaseConfig as any).apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({
      prompt: 'consent',
    });
  }
} catch (e) {
  console.warn('Firebase Auth initialization notice:', e);
}

export const auth = authInstance;


// Flag to track ongoing sign in flow
let isSigningIn = false;
// In-memory access token cache
let cachedAccessToken: string | null = null;

/**
 * Initialize Auth State Listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!authInstance) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  try {
    return onAuthStateChanged(authInstance, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch (e) {
    console.warn('onAuthStateChanged error:', e);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!authInstance || !provider) {
    throw new Error('Firebase Auth is not configured for this domain. You can still use the app locally with export/import and direct calculation features.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(authInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from credentials.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Set token manually if refreshed
 */
export const setCachedToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out and clear cached token
 */
export const logOutGoogle = async () => {
  if (authInstance) {
    try {
      await signOut(authInstance);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
  cachedAccessToken = null;
};

