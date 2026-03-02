import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, setDoc, documentId } from 'firebase/firestore';
import { queueOperation } from '@/services/storage/LocalStorageService';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import * as PedometerService from '@/services/health/PedometerService';
import { getLastNDays, today } from '@/utils/dateHelpers';

export function useSteps() {
    const { user } = useAuthStore();
    const stepTrackingEnabled = usePreferencesStore((s) => s.stepTrackingEnabled);
    const [liveSteps, setLiveSteps] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

    useEffect(() => {
        PedometerService.isPedometerAvailable().then(setIsPedometerAvailable);
    }, []);

    useEffect(() => {
        if (!isPedometerAvailable || !stepTrackingEnabled) return;
        const sub = PedometerService.subscribeToPedometer(setLiveSteps);
        return () => sub.remove();
    }, [isPedometerAvailable, stepTrackingEnabled]);

    const todayStepsQuery = useQuery({
        queryKey: ['steps', user?.uid, today()],
        queryFn: async () => {
            if (!user) return null;

            const pedData = await PedometerService.getTodaySteps();

            if (pedData) {
                const stepPayload = {
                    user_id: user.uid,
                    date: pedData.date,
                    steps: pedData.steps,
                    distance: pedData.distance,
                    calories: pedData.calories,
                    active_minutes: pedData.activeMinutes,
                    source: 'pedometer',
                };
                try {
                    await setDoc(
                        doc(db, 'users', user.uid, 'daily', pedData.date),
                        stepPayload,
                        { merge: true },
                    );
                } catch {
                    await queueOperation({
                        operation: 'SET',
                        table_name: 'daily',
                        record_id: pedData.date,
                        payload: JSON.stringify(stepPayload),
                    });
                }
            }

            return pedData;
        },
        enabled: !!user && isPedometerAvailable && stepTrackingEnabled,
        refetchInterval: 60000,
    });

    const weeklyStepsQuery = useQuery({
        queryKey: ['steps-weekly', user?.uid],
        queryFn: async () => {
            if (!user) return [];
            const days = getLastNDays(7).reverse();
            try {
                const snapshot = await getDocs(query(
                    collection(db, 'users', user.uid, 'daily'),
                    where(documentId(), '>=', days[0]),
                    where(documentId(), '<=', days[6])
                ));
                return snapshot.docs
                    .filter((d) => d.data().steps != null)
                    .map((d) => ({ date: d.id, ...d.data() }));
            } catch {
                return [];
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });

    return {
        todaySteps: todayStepsQuery.data,
        liveSteps,
        weeklySteps: weeklyStepsQuery.data ?? [],
        isPedometerAvailable,
        isLoading: todayStepsQuery.isLoading,
        refetch: todayStepsQuery.refetch,
    };
}
