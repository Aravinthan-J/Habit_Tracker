import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import * as PedometerService from '@/services/health/PedometerService';
import { getLastNDays, today } from '@/utils/dateHelpers';

export function useSteps() {
    const { user } = useAuthStore();
    const [liveSteps, setLiveSteps] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

    useEffect(() => {
        PedometerService.isPedometerAvailable().then(setIsPedometerAvailable);
    }, []);

    useEffect(() => {
        if (!isPedometerAvailable) return;
        const sub = PedometerService.subscribeToPedometer(setLiveSteps);
        return () => sub.remove();
    }, [isPedometerAvailable]);

    const todayStepsQuery = useQuery({
        queryKey: ['steps', user?.uid, today()],
        queryFn: async () => {
            if (!user) return null;

            const pedData = await PedometerService.getTodaySteps();

            if (pedData) {
                // Fire-and-forget sync to Firestore
                setDoc(
                    doc(db, 'users', user.uid, 'step_data', pedData.date),
                    {
                        user_id: user.uid,
                        date: pedData.date,
                        steps: pedData.steps,
                        distance: pedData.distance,
                        calories: pedData.calories,
                        active_minutes: pedData.activeMinutes,
                        source: 'pedometer',
                    },
                    { merge: true }
                ).catch(() => {});
            }

            return pedData;
        },
        enabled: !!user && isPedometerAvailable,
        refetchInterval: 60000,
    });

    const weeklyStepsQuery = useQuery({
        queryKey: ['steps-weekly', user?.uid],
        queryFn: async () => {
            if (!user) return [];
            const days = getLastNDays(7).reverse();
            try {
                const snapshot = await getDocs(query(
                    collection(db, 'users', user.uid, 'step_data'),
                    where('date', '>=', days[0]),
                    where('date', '<=', days[6])
                ));
                return snapshot.docs.map((d) => d.data());
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
