import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PedometerService } from '../services/pedometer';
import { StepRepository } from '../db/step.repository';
import { getTodayStr } from '../utils/date';
import { useStepStore } from '../store/step-store';

export const useSteps = () => {
    const queryClient = useQueryClient();
    const { currentSteps, setSteps, stepGoal } = useStepStore();

    const stepsQuery = useQuery({
        queryKey: ['steps', 'today'],
        queryFn: async () => {
            const today = getTodayStr();
            const dbEntry = StepRepository.getByDate(today);
            return dbEntry;
        },
    });

    const saveSteps = useMutation({
        mutationFn: ({ steps, goal }: { steps: number; goal: number }) =>
            PedometerService.saveDailySteps(steps, goal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['steps'] });
        },
    });

    useEffect(() => {
        let subscription: any;

        const startTracking = async () => {
            const isAvailable = await PedometerService.checkAvailability();
            if (!isAvailable) return;

            // Start from what's in DB today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const now = new Date();

            const initial = await PedometerService.getStepsForRange(today, now);
            setSteps(initial.steps);

            subscription = PedometerService.subscribe((result) => {
                // Pedometer result is delta since start of watch, but we want absolute for the day
                // This is a simplified implementation; real-world might need more logic
                setSteps(currentSteps + result.steps);
            });
        };

        startTracking();

        return () => {
            subscription?.remove();
        };
    }, []);

    // Debounced save would be better, but for now we save on unmount or explicitly
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentSteps > 0) {
                saveSteps.mutate({ steps: currentSteps, goal: stepGoal });
            }
        }, 5000); // Save every 5 seconds of change

        return () => clearTimeout(timer);
    }, [currentSteps, stepGoal]);

    return {
        steps: currentSteps,
        goal: stepGoal,
        history: stepsQuery.data,
        isLoading: stepsQuery.isLoading,
    };
};
