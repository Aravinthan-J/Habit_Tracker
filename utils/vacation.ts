import { today, formatDate } from './dateHelpers';

/** Vacation is active if it has started and hasn't ended before today. */
export function isVacationActive(
    start: string | null,
    end: string | null,
    ref: string = today(),
): boolean {
    if (!start) return false;
    if (start > ref) return false;
    return end == null || end >= ref;
}

/**
 * All dates (YYYY-MM-DD) covered by a vacation period, from start through
 * min(end, today). These bridge streaks so missed days don't break them.
 */
export function getVacationDates(
    start: string | null,
    end: string | null,
    ref: string = today(),
): string[] {
    if (!start) return [];
    const last = end && end < ref ? end : ref;
    if (start > last) return [];

    const out: string[] = [];
    const [y, m, d] = start.split('-').map(Number);
    const cursor = new Date(y, m - 1, d);
    let guard = 0;
    while (guard++ < 730) {
        const ds = formatDate(cursor);
        if (ds > last) break;
        out.push(ds);
        cursor.setDate(cursor.getDate() + 1);
    }
    return out;
}
