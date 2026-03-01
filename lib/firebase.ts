import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: 'AIzaSyANX1ldiOAMli8BaCXIx23hcR53tV5r9Os',
    authDomain: 'habity-8b532.firebaseapp.com',
    projectId: 'habity-8b532',
    storageBucket: 'habity-8b532.firebasestorage.app',
    messagingSenderId: '20069212711',
    appId: '1:20069212711:web:55b84bb49ec5dacf13a402',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function getFirebaseAuth() {
    try {
        return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch {
        return getAuth(app);
    }
}

export const auth = getFirebaseAuth();
export const db = getFirestore(app);

// Android client ID — from google-services.json → oauth_client → client_type 3
export const GOOGLE_ANDROID_CLIENT_ID = '20069212711-oj3minl0m0eko1ukk9i1rrq58jdp5tmi.apps.googleusercontent.com';

// Web client ID — find it at:
// Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration → Web client ID
export const GOOGLE_WEB_CLIENT_ID = '20069212711-oj3minl0m0eko1ukk9i1rrq58jdp5tmi.apps.googleusercontent.com';
