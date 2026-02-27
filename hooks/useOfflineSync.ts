import { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processQueue } from '@/services/sync/SyncService';
import { useSyncStore } from '@/store/syncStore';

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const { isSyncing, setSyncing, setLastSync } = useSyncStore();
    const isSyncingRef = useRef(isSyncing);

    useEffect(() => {
        isSyncingRef.current = isSyncing;
    }, [isSyncing]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);

            if (online && !isSyncingRef.current) {
                runSync();
            }
        });
        return () => unsubscribe();
    }, []);

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
