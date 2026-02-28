import { db } from './sqlite';

export interface Habit {
    id: string;
    title: string;
    color: string;
    created_at: string;
    archived: number;
}

export const HabitRepository = {
    create: (habit: Habit) => {
        return db.runSync(
            'INSERT INTO habits (id, title, color, created_at, archived) VALUES (?, ?, ?, ?, ?)',
            [habit.id, habit.title, habit.color, habit.created_at, habit.archived]
        );
    },

    getAll: (): Habit[] => {
        return db.getAllSync<Habit>('SELECT * FROM habits WHERE archived = 0 ORDER BY created_at DESC');
    },

    getById: (id: string): Habit | null => {
        return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', [id]);
    },

    update: (habit: Partial<Habit> & { id: string }) => {
        const fields = Object.keys(habit).filter(key => key !== 'id');
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const params = fields.map(field => (habit as any)[field]);
        params.push(habit.id);

        return db.runSync(`UPDATE habits SET ${setClause} WHERE id = ?`, params);
    },

    delete: (id: string) => {
        return db.runSync('DELETE FROM habits WHERE id = ?', [id]);
    },

    archive: (id: string) => {
        return db.runSync('UPDATE habits SET archived = 1 WHERE id = ?', [id]);
    },
};
