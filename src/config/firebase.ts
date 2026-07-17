import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { env } from './env';

function buildCredential(): admin.credential.Credential {
  const { serviceAccountPath, projectId, clientEmail, privateKey } = env.firebase;

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_PATH is set to "${serviceAccountPath}" but the file was not found at ${resolvedPath}`
      );
    }
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
    return admin.credential.cert(serviceAccount);
  }

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  throw new Error(
    'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_PATH or ' +
    'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.'
  );
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: buildCredential()
  });
}

export const firestore = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
