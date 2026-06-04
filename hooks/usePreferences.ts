import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';

export function usePreferences() {
    const { user } = useAuthStore();
    const store = usePreferencesStore();

    // Load preferences from Firestore whenever the user changes (login / app start)
    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, 'users', user.uid)).then((snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (data.notifications_enabled != null) store.setNotificationsEnabled(data.notifications_enabled);
            if (data.reminder_time != null) store.setReminderTime(data.reminder_time);
            if (data.step_tracking_enabled != null) store.setStepTrackingEnabled(data.step_tracking_enabled);
            if (data.water_reminder_enabled != null) store.setWaterReminderEnabled(data.water_reminder_enabled);
            if (data.water_interval_hours != null) store.setWaterIntervalHours(data.water_interval_hours);
        });
    }, [user?.uid]);

    const setNotificationsEnabled = async (value: boolean) => {
        store.setNotificationsEnabled(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { notifications_enabled: value }, { merge: true });
    };

    const setReminderTime = async (value: string) => {
        store.setReminderTime(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { reminder_time: value }, { merge: true });
    };

    const setStepTrackingEnabled = async (value: boolean) => {
        store.setStepTrackingEnabled(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { step_tracking_enabled: value }, { merge: true });
    };

    const setWaterReminderEnabled = async (value: boolean) => {
        store.setWaterReminderEnabled(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { water_reminder_enabled: value }, { merge: true });
    };

    const setWaterIntervalHours = async (value: number) => {
        store.setWaterIntervalHours(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { water_interval_hours: value }, { merge: true });
    };

    return {
        notificationsEnabled: store.notificationsEnabled,
        reminderTime: store.reminderTime,
        stepTrackingEnabled: store.stepTrackingEnabled,
        waterReminderEnabled: store.waterReminderEnabled,
        waterIntervalHours: store.waterIntervalHours,
        setNotificationsEnabled,
        setReminderTime,
        setStepTrackingEnabled,
        setWaterReminderEnabled,
        setWaterIntervalHours,
    };
}
