import { useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validators';

export function useAuth() {
    const { user, isLoading, isOffline, setUser, setLoading, setupDummyUser, clear } = useAuthStore();

    useEffect(() => {
        let mounted = true;

        // Fallback to offline/dummy mode if Firebase doesn't respond within 5s
        const sessionTimeout = setTimeout(() => {
            if (mounted && isLoading) setupDummyUser();
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            clearTimeout(sessionTimeout);
            if (mounted) {
                setUser(firebaseUser);
                setLoading(false);
            }
        }, () => {
            clearTimeout(sessionTimeout);
            if (mounted) setupDummyUser();
        });

        return () => {
            mounted = false;
            clearTimeout(sessionTimeout);
            unsubscribe();
        };
    }, []);

    const offlineError = { error: { message: 'You appear to be offline. Please check your connection and try again.' } };

    const signIn = async (email: string, password: string) => {
        if (isOffline) return offlineError;
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { data: result, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err.message } };
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        if (isOffline) return offlineError;
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };
        const { valid, errors } = isValidPassword(password);
        if (!valid) return { error: { message: errors.join(', ') } };

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });

            // Write profile document to Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email,
                name,
                step_goal: 10000,
                reminder_time: '20:00',
                timezone: 'UTC',
                theme: 'dark',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            return { data: result, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err.message } };
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        clear();
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { data: {}, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err.message } };
        }
    };

    return { user, isLoading, signIn, signUp, signOut, resetPassword };
}
