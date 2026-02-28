import { db } from './sqlite';

export interface Badge {
    id: string;
    name: string;
    type: string;
    requirement: number;
    earned_at: string | null;
}

export const BadgeRepository = {
    getAll: (): Badge[] => {
        return db.getAllSync<Badge>('SELECT * FROM badges');
    },

    getEarned: (): Badge[] => {
        return db.getAllSync<Badge>('SELECT * FROM badges WHERE earned_at IS NOT NULL');
    },

    markEarned: (id: string, earnedAt: string) => {
        return db.runSync('UPDATE badges SET earned_at = ? WHERE id = ?', [earnedAt, id]);
    },

    initBadges: (defaultBadges: Badge[]) => {
        db.withTransactionSync(() => {
            for (const badge of defaultBadges) {
                db.runSync(
                    'INSERT OR IGNORE INTO badges (id, name, type, requirement, earned_at) VALUES (?, ?, ?, ?, ?)',
                    [badge.id, badge.name, badge.type, badge.requirement, badge.earned_at]
                );
            }
        });
    },
};
