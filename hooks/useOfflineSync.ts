import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processQueue } from '@/services/sync/SyncService';
import { useSyncStore } from '@/store/syncStore';

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const { isSyncing, setSyncing, setLastSync } = useSyncStore();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);

            if (online && !isSyncing) {
                runSync();
            }
        });
        return () => unsubscribe();
    }, [isSyncing]);

    const runSync = async () => {
        setSyncing(true);
        try {
            await processQueue();
            setLastSync(new Date().toISOString());
        } finally {
            setSyncing(false);
        }
    };

    return { isOnline, isSyncing, runSync };
}
