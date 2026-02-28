import { useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validators';

export function useAuth() {
    const { user, isLoading, setUser, setLoading, clear } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { data: result, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err.message } };
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        if (!isValidEmail(email)) return { error: { message: 'Invalid email address' } };
        const { valid, errors } = isValidPassword(password);
        if (!valid) return { error: { message: errors.join(', ') } };

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
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

    const signInWithGoogle = async (idToken: string) => {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const result = await signInWithCredential(auth, credential);
            // Create or update Firestore profile (merge so existing data is preserved)
            await setDoc(doc(db, 'users', result.user.uid), {
                email: result.user.email,
                name: result.user.displayName,
                step_goal: 10000,
                reminder_time: '20:00',
                timezone: 'UTC',
                theme: 'dark',
                updated_at: new Date().toISOString(),
            }, { merge: true });
            return { data: result, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err.message } };
        }
    };

    return { user, isLoading, signIn, signUp, signOut, resetPassword, signInWithGoogle };
}
