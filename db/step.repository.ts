import { db } from './sqlite';

export interface StepRecord {
    id: string;
    date: string;
    steps: number;
    goal: number;
    distance: number;
    created_at: string;
}

export const StepRepository = {
    upsert: (record: StepRecord) => {
        return db.runSync(
            `INSERT INTO steps (id, date, steps, goal, distance, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
       steps = excluded.steps,
       distance = excluded.distance`,
            [record.id, record.date, record.steps, record.goal, record.distance, record.created_at]
        );
    },

    getByDate: (date: string): StepRecord | null => {
        return db.getFirstSync<StepRecord>('SELECT * FROM steps WHERE date = ?', [date]);
    },

    getHistory: (startDate: string, endDate: string): StepRecord[] => {
        return db.getAllSync<StepRecord>(
            'SELECT * FROM steps WHERE date BETWEEN ? AND ? ORDER BY date ASC',
            [startDate, endDate]
        );
    },

    getStats: () => {
        return db.getFirstSync<{ total_steps: number; avg_steps: number; count: number }>(
            'SELECT SUM(steps) as total_steps, AVG(steps) as avg_steps, COUNT(*) as count FROM steps'
        );
    },
};
