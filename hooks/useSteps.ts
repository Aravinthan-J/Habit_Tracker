import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
        queryKey: ['steps', user?.id, today()],
        queryFn: async () => {
            if (!user) return null;

            const pedData = await PedometerService.getTodaySteps();

            if (pedData) {
                // Fire-and-forget sync to Supabase
                supabase.from('step_data').upsert({
                    user_id: user.id,
                    date: pedData.date,
                    steps: pedData.steps,
                    distance: pedData.distance,
                    calories: pedData.calories,
                    active_minutes: pedData.activeMinutes,
                    source: 'pedometer',
                }, { onConflict: 'user_id,date' }).then();
            }

            return pedData;
        },
        enabled: !!user && isPedometerAvailable,
        refetchInterval: 60000,
    });

    const weeklyStepsQuery = useQuery({
        queryKey: ['steps-weekly', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const days = getLastNDays(7).reverse();
            const { data } = await supabase
                .from('step_data')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', days[0])
                .lte('date', days[6]);
            return data ?? [];
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
