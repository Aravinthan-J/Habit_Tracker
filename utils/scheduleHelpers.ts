/** Returns true if a habit is scheduled to appear on the given date. */
export function isScheduledOn(scheduleDays: number[] | null | undefined, dateStr: string): boolean {
    if (!scheduleDays || scheduleDays.length === 0) return true;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return scheduleDays.includes(dow);
}

/**
 * Returns all dates in the lookback window (today - lookbackDays … today)
 * that are NOT scheduled for this habit. These can be passed as bridge dates
 * to the streak calculator so unscheduled days don't break streaks.
 */
export function getUnscheduledDates(
    scheduleDays: number[] | null | undefined,
    todayStr: string,
    lookbackDays = 90,
): string[] {
    if (!scheduleDays || scheduleDays.length === 0) return [];
    const result: string[] = [];
    const [y, m, d] = todayStr.split('-').map(Number);
    const base = new Date(y, m - 1, d);
    for (let i = 1; i <= lookbackDays; i++) {
        const dt = new Date(base);
        dt.setDate(base.getDate() - i);
        if (!scheduleDays.includes(dt.getDay())) {
            result.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`);
        }
    }
    return result;
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
