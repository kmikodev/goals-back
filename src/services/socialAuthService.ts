import { auth } from '../config/firebase';
import { createOrUpdateUser } from './authService';

export const handleSocialAuth = async (provider, idToken) => {
  try {
    // Verify the ID token first
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Get additional user info from Firebase
    const firebaseUser = await auth.getUser(decodedToken.uid);
    
    // Create or update user in our database
    const user = await createOrUpdateUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      provider: provider
    });

    // Create a custom token for the client
    const customToken = await auth.createCustomToken(firebaseUser.uid);

    return {
      user,
      token: customToken
    };
  } catch (error) {
    console.error(`Error in ${provider} authentication:`, error);
    throw error;
  }
};