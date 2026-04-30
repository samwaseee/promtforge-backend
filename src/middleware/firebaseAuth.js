import admin from 'firebase-admin';
import 'dotenv/config';

// Initialize Firebase Admin using the string from .env
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split('Bearer ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // This decodedToken contains the UID, email, and name from Firebase
    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error("Firebase Verify Error:", error);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
};