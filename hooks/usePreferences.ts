import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore, ThemeMode } from '@/store/preferencesStore';

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
            if (data.water_goal_glasses != null) store.setWaterGoalGlasses(data.water_goal_glasses);
            if (data.pet_tone === 'gentle' || data.pet_tone === 'savage') store.setPetTone(data.pet_tone);
            if (data.theme_mode === 'light' || data.theme_mode === 'dark' || data.theme_mode === 'system') store.setThemeMode(data.theme_mode);
            if (typeof data.accent_color === 'string') store.setAccentColor(data.accent_color);
            if (data.smart_reminders_enabled != null) store.setSmartRemindersEnabled(data.smart_reminders_enabled);
            if (data.weekly_review_enabled != null) store.setWeeklyReviewEnabled(data.weekly_review_enabled);
            if (data.vacation_start !== undefined || data.vacation_end !== undefined) {
                store.setVacation(data.vacation_start ?? null, data.vacation_end ?? null);
            }
        });
    }, [user?.uid]);

    const setVacation = async (start: string | null, end: string | null) => {
        store.setVacation(start, end);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { vacation_start: start, vacation_end: end }, { merge: true });
    };

    const setSmartRemindersEnabled = async (value: boolean) => {
        store.setSmartRemindersEnabled(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { smart_reminders_enabled: value }, { merge: true });
    };

    const setWeeklyReviewEnabled = async (value: boolean) => {
        store.setWeeklyReviewEnabled(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { weekly_review_enabled: value }, { merge: true });
    };

    const setThemeMode = async (value: ThemeMode) => {
        store.setThemeMode(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { theme_mode: value }, { merge: true });
    };

    const setAccentColor = async (value: string) => {
        store.setAccentColor(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { accent_color: value }, { merge: true });
    };

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

    const setWaterGoalGlasses = async (value: number) => {
        store.setWaterGoalGlasses(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { water_goal_glasses: value }, { merge: true });
    };

    const setPetTone = async (value: 'gentle' | 'savage') => {
        store.setPetTone(value);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), { pet_tone: value }, { merge: true });
    };

    return {
        themeMode: store.themeMode,
        setThemeMode,
        accentColor: store.accentColor,
        setAccentColor,
        vacationStart: store.vacationStart,
        vacationEnd: store.vacationEnd,
        setVacation,
        smartRemindersEnabled: store.smartRemindersEnabled,
        setSmartRemindersEnabled,
        weeklyReviewEnabled: store.weeklyReviewEnabled,
        setWeeklyReviewEnabled,
        notificationsEnabled: store.notificationsEnabled,
        reminderTime: store.reminderTime,
        stepTrackingEnabled: store.stepTrackingEnabled,
        waterReminderEnabled: store.waterReminderEnabled,
        waterIntervalHours: store.waterIntervalHours,
        waterGoalGlasses: store.waterGoalGlasses,
        petTone: store.petTone,
        setNotificationsEnabled,
        setReminderTime,
        setStepTrackingEnabled,
        setWaterReminderEnabled,
        setWaterIntervalHours,
        setWaterGoalGlasses,
        setPetTone,
    };
}
