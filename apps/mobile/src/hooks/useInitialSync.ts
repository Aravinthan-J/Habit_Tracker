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

export function useInitialSync() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    console.log('🔍 useInitialSync effect triggered. user?.id:', user?.id);

    const performInitialSync = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID, skipping sync');
        return;
      }

      if (syncInProgressRef.current) {
        console.log('⚠️ Sync already in progress, skipping');
        return;
      }

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

        // Use user-specific migration key so switching accounts triggers fresh sync
        const migrationKey = `initial_sync_${user.id}`;
        const migrationDone = await AsyncStorage.getItem(migrationKey);

        if (migrationDone) {
          const habits = await HabitRepository.getAll(user.id);

          if (habits.length > 0) {
            console.log(`✓ Already synced and DB has ${habits.length} habits, skipping`);
            return;
          } else {
            console.log('⚠️ Sync marked complete but DB is empty. Re-syncing...');
            // Clear stale flag so SyncService runs full migration again
            await AsyncStorage.removeItem(migrationKey);
          }
        }

        if (!networkMonitor.isConnected()) {
          console.log('⚠️ No network connection, skipping initial sync');
          return;
        }

        console.log('🚀 Starting initial sync...');
        const result = await syncService.performFullSync(user.id);

        if (result.success) {
          await AsyncStorage.setItem(migrationKey, 'true');
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
