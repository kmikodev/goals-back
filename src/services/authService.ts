import { auth } from '../config/firebase';
import { User } from '../models/User';

export const createOrUpdateUser = async (firebaseUser) => {
  try {
    const existingUser = await User.findOne({ firebaseId: firebaseUser.uid });
    
    if (existingUser) {
      return existingUser;
    }

    const newUser = new User({
      firebaseId: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
};

export const verifyAndCreateUser = async (idToken) => {
  try {
    console.log('idToken:', idToken);
    const decodedToken = await auth.verifyIdToken(idToken);
    const firebaseUser = await auth.getUser(decodedToken.uid);
    return await createOrUpdateUser(firebaseUser);
  } catch (error) {
    console.error('Error in verifyAndCreateUser:', error);
    throw error;
  }
};