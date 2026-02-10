import type { Habit, Completion } from '@habit-tracker/shared-types';
import type { StepData } from '../database/repositories/StepRepository';

export type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'max-value';

export interface ConflictResolution<T> {
  resolved: T;
  strategy: ConflictStrategy;
}

export class ConflictResolver {
  /**
   * Resolve habit conflicts - server wins for habits
   * Rationale: Habit metadata (title, color, etc.) should be consistent across devices
   */
  static resolveHabit(
    local: Habit,
    server: Habit
  ): ConflictResolution<Habit> {
    // Server wins - use the most recently updated version
    const localDate = new Date(local.updatedAt);
    const serverDate = new Date(server.updatedAt);

    if (serverDate >= localDate) {
      return {
        resolved: server,
        strategy: 'server-wins',
      };
    }

    return {
      resolved: local,
      strategy: 'client-wins',
    };
  }

  /**
   * Resolve completion conflicts - merge (union)
   * Rationale: If a habit was marked complete on either device, it should be complete
   */
  static resolveCompletion(
    local: Completion | null,
    server: Completion | null
  ): ConflictResolution<Completion | null> {
    // If either side has the completion, keep it (union merge)
    if (local && server) {
      // Both exist - use the one with earlier completedAt (first completion wins)
      const localDate = new Date(local.completedAt);
      const serverDate = new Date(server.completedAt);

      return {
        resolved: localDate <= serverDate ? local : server,
        strategy: 'merge',
      };
    }

    if (local) {
      return {
        resolved: local,
        strategy: 'merge',
      };
    }

    if (server) {
      return {
        resolved: server,
        strategy: 'merge',
      };
    }

    return {
      resolved: null,
      strategy: 'merge',
    };
  }

  /**
   * Resolve step data conflicts - max value
   * Rationale: Pedometer readings can vary, use the highest count as it's likely more accurate
   */
  static resolveStepData(
    local: StepData | null,
    server: StepData | null
  ): ConflictResolution<StepData | null> {
    if (!local && !server) {
      return { resolved: null, strategy: 'max-value' };
    }

    if (!local) {
      return { resolved: server, strategy: 'max-value' };
    }

    if (!server) {
      return { resolved: local, strategy: 'max-value' };
    }

    // Use the one with more steps (max value)
    if (local.steps >= server.steps) {
      return {
        resolved: {
          ...local,
          // Keep the higher values for distance and calories too
          distance: Math.max(local.distance, server.distance),
          calories: Math.max(local.calories, server.calories),
        },
        strategy: 'max-value',
      };
    }

    return {
      resolved: {
        ...server,
        distance: Math.max(local.distance, server.distance),
        calories: Math.max(local.calories, server.calories),
      },
      strategy: 'max-value',
    };
  }

  /**
   * Merge arrays of completions from two sources
   * Creates a union of completions (if completed on either device, it's complete)
   */
  static mergeCompletions(
    local: Completion[],
    server: Completion[]
  ): Completion[] {
    const merged = new Map<string, Completion>();

    // Add all local completions
    local.forEach((completion) => {
      const key = `${completion.habitId}-${completion.date}`;
      merged.set(key, completion);
    });

    // Add server completions (or keep existing if earlier)
    server.forEach((completion) => {
      const key = `${completion.habitId}-${completion.date}`;
      const existing = merged.get(key);

      if (!existing) {
        merged.set(key, completion);
      } else {
        // Keep the one with earlier completedAt
        const existingDate = new Date(existing.completedAt);
        const serverDate = new Date(completion.completedAt);

        if (serverDate < existingDate) {
          merged.set(key, completion);
        }
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Merge step data arrays from two sources
   * Uses max value for each date
   */
  static mergeStepData(local: StepData[], server: StepData[]): StepData[] {
    const merged = new Map<string, StepData>();

    // Add all local step data
    local.forEach((stepData) => {
      merged.set(stepData.date, stepData);
    });

    // Merge server step data using max value strategy
    server.forEach((serverData) => {
      const existing = merged.get(serverData.date);

      if (!existing) {
        merged.set(serverData.date, serverData);
      } else {
        const resolution = this.resolveStepData(existing, serverData);
        if (resolution.resolved) {
          merged.set(serverData.date, resolution.resolved);
        }
      }
    });

    return Array.from(merged.values());
  }
}
