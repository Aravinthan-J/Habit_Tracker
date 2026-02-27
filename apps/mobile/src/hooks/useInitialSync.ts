/**
 * Initial Sync Hook
 * Handles syncing data on app startup and invalidating query cache
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { syncService } from '../services/sync/SyncService';
import { networkMonitor } from '../services/sync/NetworkMonitor';
import { databaseService } from '../services/database/DatabaseService';
import { HabitRepository } from '../services/database/repositories/HabitRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIGRATION_KEY = 'initial_data_migration_complete';

export function useInitialSync() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const syncInProgressRef = useRef(false);
  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    console.log('🔍 useInitialSync effect triggered. user?.id:', user?.id);

    const performInitialSync = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID, skipping sync');
        return;
      }

      if (syncInProgressRef.current || syncAttemptedRef.current) {
        console.log('⚠️ Sync already in progress or attempted, skipping');
        return;
      }

      syncAttemptedRef.current = true;
      syncInProgressRef.current = true;

      try {
        // Wait for database to be initialized (max 10 attempts, 500ms each = 5 seconds)
        let dbReady = false;
        for (let i = 0; i < 10; i++) {
          if (databaseService.isReady()) {
            dbReady = true;
            break;
          }
          console.log(`⏳ Waiting for database... (${i + 1}/10)`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!dbReady) {
          console.log('❌ Database initialization timeout, skipping sync');
          return;
        }

        // Check if initial migration already done
        const migrationDone = await AsyncStorage.getItem(MIGRATION_KEY);

        if (migrationDone) {
          // Migration was marked complete, but check if DB is actually populated
          const habits = await HabitRepository.getAll(user.id);

          if (habits.length > 0) {
            console.log(`✓ Initial migration already completed and DB has ${habits.length} habits, skipping sync`);
            return;
          } else {
            console.log('⚠️ Migration marked complete but DB is empty. Re-syncing...');
          }
        }

        if (!networkMonitor.isConnected()) {
          console.log('⚠️ No network connection, skipping initial sync');
          return;
        }

        console.log('🚀 Starting initial sync...');
        const result = await syncService.performFullSync(user.id);

        if (result.success) {
          // Invalidate all queries to force fresh load from local DB
          console.log('🔄 Invalidating query cache after initial sync');
          await queryClient.invalidateQueries({ queryKey: ['habits'] });
          await queryClient.invalidateQueries({ queryKey: ['completions'] });
          console.log(`✅ Initial sync complete: ${result.synced.habits} habits loaded`);
        } else {
          console.log('❌ Initial sync failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Initial sync error:', error);
      } finally {
        syncInProgressRef.current = false;
      }
    };

    performInitialSync();
  }, [user?.id, queryClient]);
}
