import getDatabase from '@/lib/database';
import { generateId } from './storage/LocalStorageService';

export class MockDataService {
    static DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

    static async seedDummyData() {
        const db = await getDatabase();
        const userId = this.DUMMY_USER_ID;

        // 1. Clear existing dummy data (optional, but good for resets)
        await db.runAsync('DELETE FROM local_habits WHERE user_id = ?', [userId]);
        await db.runAsync('DELETE FROM local_completions WHERE user_id = ?', [userId]);

        // 2. Create Dummy Habits
        const now = new Date();
        const habits = [
            { id: generateId(), title: 'Morning Meditation', color: '#6C63FF', icon: 'leaf-outline', goal: 30 },
            { id: generateId(), title: 'Drink Water (2L)', color: '#00C2FF', icon: 'water-outline', goal: 30 },
            { id: generateId(), title: 'Read 20 Pages', color: '#FF9F00', icon: 'book-outline', goal: 20 },
            { id: generateId(), title: 'Exercise', color: '#FF4B2B', icon: 'fitness-outline', goal: 25 },
            { id: generateId(), title: 'Deep Work Session', color: '#8E44AD', icon: 'code-working-outline', goal: 20 },
            { id: generateId(), title: 'No Social Media', color: '#2ECC71', icon: 'phone-portrait-outline', goal: 30 },
            { id: generateId(), title: 'Daily Journal', color: '#E67E22', icon: 'create-outline', goal: 15 },
        ];

        for (const h of habits) {
            await db.runAsync(
                `INSERT INTO local_habits (id, user_id, title, monthly_goal, color, icon, notifications_enabled, created_at, updated_at, synced)
                 VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 1)`,
                [h.id, userId, h.title, h.goal, h.color, h.icon, new Date().toISOString(), new Date().toISOString()]
            );

            // 3. Seed Completions for the last 30 days with some randomness
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // Randomly skip some days to make it look realistic
                if (Math.random() > 0.3) {
                    await db.runAsync(
                        `INSERT INTO local_completions (id, habit_id, user_id, date, completed_at, synced)
                         VALUES (?, ?, ?, ?, ?, 1)`,
                        [generateId(), h.id, userId, dateStr, new Date(date).toISOString()]
                    );
                }
            }
        }

        // 4. Seed some Step Data for analytics
        await db.runAsync('DELETE FROM step_data WHERE user_id = ?', [userId]);
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const steps = Math.floor(Math.random() * 5000) + 5000; // 5k-10k steps

            // Note: step_data table might not exist in local SQLite yet if it's only in Supabase
            // If it doesn't exist, skip. (Checking if table exists is better)
            try {
                await db.runAsync(
                    `INSERT INTO step_data (id, user_id, date, steps, source, created_at)
                     VALUES (?, ?, ?, ?, 'pedometer', ?)`,
                    [generateId(), userId, dateStr, steps, new Date().toISOString()]
                );
            } catch (e) {
                // Table might be missing in local DB if not defined in local schema
                console.log('step_data table missing in local SQLite, skipping step seed');
            }
        }
    }
}
