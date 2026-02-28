import { db } from './sqlite';

export interface Completion {
    id: string;
    habit_id: string;
    date: string;
}

export const CompletionRepository = {
    toggle: (habitId: string, date: string) => {
        const existing = db.getFirstSync<Completion>(
            'SELECT * FROM completions WHERE habit_id = ? AND date = ?',
            [habitId, date]
        );

        if (existing) {
            db.runSync('DELETE FROM completions WHERE habit_id = ? AND date = ?', [habitId, date]);
            return false; // Not completed anymore
        } else {
            const id = `${habitId}_${date}`;
            db.runSync(
                'INSERT INTO completions (id, habit_id, date) VALUES (?, ?, ?)',
                [id, habitId, date]
            );
            return true; // Completed
        }
    },

    getByHabitId: (habitId: string): Completion[] => {
        return db.getAllSync<Completion>('SELECT * FROM completions WHERE habit_id = ?', [habitId]);
    },

    getCompletionsForDate: (date: string): Completion[] => {
        return db.getAllSync<Completion>('SELECT * FROM completions WHERE date = ?', [date]);
    },

    getCompletionHistory: (habitIds: string[], startDate: string, endDate: string): Completion[] => {
        const placeholders = habitIds.map(() => '?').join(',');
        return db.getAllSync<Completion>(
            `SELECT * FROM completions WHERE habit_id IN (${placeholders}) AND date BETWEEN ? AND ?`,
            [...habitIds, startDate, endDate]
        );
    },
};
