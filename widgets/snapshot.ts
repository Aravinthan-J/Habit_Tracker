import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WidgetHabit {
    id: string;
    title: string;
    icon: string;   // already resolved to an emoji
    done: boolean;
}

export interface WidgetSnapshot {
    date: string;
    total: number;
    done: number;
    accent: string;
    habits: WidgetHabit[];
}

/** A tap made on the widget that still needs to be committed by the app. */
export interface PendingToggle {
    habitId: string;
    date: string;
    done: boolean; // intended new state
}

const SNAPSHOT_KEY = 'widget:today';
const PENDING_KEY = 'widget:pendingToggles';

export const EMPTY_SNAPSHOT: WidgetSnapshot = {
    date: '', total: 0, done: 0, accent: '#6C63FF', habits: [],
};

export async function saveWidgetSnapshot(s: WidgetSnapshot): Promise<void> {
    await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s)).catch(() => { });
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot> {
    try {
        const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
        return raw ? { ...EMPTY_SNAPSHOT, ...JSON.parse(raw) } : EMPTY_SNAPSHOT;
    } catch {
        return EMPTY_SNAPSHOT;
    }
}

export async function addPendingToggle(t: PendingToggle): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(PENDING_KEY);
        const list: PendingToggle[] = raw ? JSON.parse(raw) : [];
        // Keep only the latest intent per habit/date.
        const next = list.filter((p) => !(p.habitId === t.habitId && p.date === t.date));
        next.push(t);
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
}

export async function readPendingToggles(): Promise<PendingToggle[]> {
    try {
        const raw = await AsyncStorage.getItem(PENDING_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function clearPendingToggles(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_KEY).catch(() => { });
}
