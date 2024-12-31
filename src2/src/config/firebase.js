import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const serviceAccount =  JSON.parse(atob(process.env.FIREBASE_SERVICE_ACCOUNT));

const app = initializeApp({
  credential: cert(serviceAccount)
});

export const auth = getAuth(app);