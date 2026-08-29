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

export const formatAuthError = (error: any, language: 'lo' | 'en' = 'lo'): { message: string; isDomainError: boolean; code: string } => {
  const code = error?.code || '';
  const domain = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      isDomainError: true,
      message: language === 'lo'
        ? `ໂດເມນ "${domain}" ຍັງບໍ່ທັນໄດ້ຮັບອະນຸຍາດໃນ Firebase Console. (ກະລຸນາເພີ່ມ ${domain} ໃນ Firebase Auth > Settings > Authorized domains)`
        : `Domain "${domain}" is not authorized for OAuth. Please add it to Firebase Console > Authentication > Settings > Authorized domains.`,
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      code,
      isDomainError: false,
      message: language === 'lo'
        ? 'ບຣາວເຊີໄດ້ບລັອກໜ້າຕ່າງ Pop-up. ກະລຸນາອະນຸຍາດ Pop-up ໃນ Browser ແລ້ວລອງໃໝ່.'
        : 'Sign-in popup was blocked by browser. Please allow popups for this site.',
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      isDomainError: false,
      message: language === 'lo'
        ? 'ທ່ານໄດ້ປິດໜ້າຕ່າງເຂົ້າສູ່ລະບົບກ່ອນສຳເລັດ.'
        : 'Sign-in popup was closed before completing authentication.',
    };
  }

  if (code === 'auth/cancelled-popup-request') {
    return {
      code,
      isDomainError: false,
      message: language === 'lo'
        ? 'ການເຂົ້າສູ່ລະບົບຖືກຍົກເລີກ.'
        : 'Sign-in request was cancelled.',
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      code,
      isDomainError: false,
      message: language === 'lo'
        ? 'ການເຊື່ອມຕໍ່ເຄືອຂ່າຍຂັດຂ້ອງ. ກະລຸນາກວດສອບອິນເຕີເນັດ.'
        : 'Network connection failed. Please check your internet.',
    };
  }

  return {
    code,
    isDomainError: false,
    message: error?.message || (language === 'lo' ? 'ການເຂົ້າສູ່ລະບົບຂັດຂ້ອງ' : 'Sign-in failed'),
  };
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
  } catch (error: any) {
    console.error('Sign in error detail:', error);
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

