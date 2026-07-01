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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { isValidEmail, isValidPassword } from '@/utils/validators';

/** Local cache key for instant avatar display before Firestore responds. */
const PHOTO_CACHE_KEY = 'profile_photo_uri';

export function useAuth() {
    const { user, photoUri, isLoading, setUser, setPhotoUri, setLoading, clear } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
            if (!firebaseUser) {
                setPhotoUri(null);
                AsyncStorage.removeItem(PHOTO_CACHE_KEY).catch(() => { });
                return;
            }
            // Show the locally-cached avatar immediately, then refresh from Firestore.
            AsyncStorage.getItem(PHOTO_CACHE_KEY).then((cached) => {
                if (cached) setPhotoUri(cached);
            }).catch(() => { });
            getDoc(doc(db, 'users', firebaseUser.uid)).then((snap) => {
                const remote = snap.exists() ? (snap.data().photo_url as string | undefined) : undefined;
                if (remote) {
                    setPhotoUri(remote);
                    AsyncStorage.setItem(PHOTO_CACHE_KEY, remote).catch(() => { });
                }
            }).catch(() => { });
        });
        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const updateProfilePhoto = async (localUri: string) => {
        if (!auth.currentUser) return { error: { message: 'Not signed in' } };
        try {
            // Firebase Storage needs the paid Blaze plan, so we keep avatars free:
            // shrink to 256px + compress, then store as a base64 data-URI in the
            // user's Firestore doc (well under Firestore's 1 MB document limit).
            // Resize by width only (height auto-scales) so a non-square source —
            // some Android croppers ignore the 1:1 aspect lock — is never distorted;
            // the avatar frame displays it with `cover`.
            const manipulated = await manipulateAsync(
                localUri,
                [{ resize: { width: 256 } }],
                { compress: 0.6, format: SaveFormat.JPEG, base64: true },
            );
            if (!manipulated.base64) return { error: { message: 'Could not process image' } };
            const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;

            await setDoc(doc(db, 'users', auth.currentUser.uid),
                { photo_url: dataUri, updated_at: new Date().toISOString() },
                { merge: true });
            setPhotoUri(dataUri);
            AsyncStorage.setItem(PHOTO_CACHE_KEY, dataUri).catch(() => { });
            return { error: null };
        } catch (err: any) {
            return { error: { message: err.message ?? 'Upload failed' } };
        }
    };

    const updateDisplayName = async (name: string) => {
        const trimmed = name.trim();
        if (!auth.currentUser) return { error: { message: 'Not signed in' } };
        if (trimmed.length < 1) return { error: { message: 'Name cannot be empty' } };
        try {
            await updateProfile(auth.currentUser, { displayName: trimmed });
            await setDoc(doc(db, 'users', auth.currentUser.uid),
                { name: trimmed, updated_at: new Date().toISOString() },
                { merge: true });
            // Push the refreshed user object into the store so the UI updates.
            setUser(auth.currentUser);
            return { error: null };
        } catch (err: any) {
            return { error: { message: err.message } };
        }
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

    return { user, photoUri, isLoading, signIn, signUp, signOut, resetPassword, signInWithGoogle, updateDisplayName, updateProfilePhoto };
}
