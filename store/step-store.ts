import { create } from 'zustand';

interface StepState {
    currentSteps: number;
    stepGoal: number;
    setSteps: (steps: number) => void;
    setGoal: (goal: number) => void;
    lastSync: string | null;
    setLastSync: (time: string) => void;
}

export const useStepStore = create<StepState>((set) => ({
    currentSteps: 0,
    stepGoal: 10000,
    setSteps: (currentSteps) => set({ currentSteps }),
    setGoal: (stepGoal) => set({ stepGoal }),
    lastSync: null,
    setLastSync: (lastSync) => set({ lastSync }),
}));
