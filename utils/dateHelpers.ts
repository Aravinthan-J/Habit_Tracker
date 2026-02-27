/**
 * Returns today's date as YYYY-MM-DD string
 */
export function today(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Format a Date or string to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

/**
 * Get the start and end dates for a given month (YYYY-MM-DD)
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
        start: formatDate(start),
        end: formatDate(end),
    };
}

/**
 * Get last N days as YYYY-MM-DD strings (newest first)
 */
export function getLastNDays(n: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
    }
    return dates;
}

/**
 * Get last 30 days (oldest first) for charts
 */
export function getLast30Days(): string[] {
    return getLastNDays(30).reverse();
}

/**
 * Get all days in a given month (YYYY-MM-DD)
 */
export function getDaysInMonth(year: number, month: number): string[] {
    const days: string[] = [];
    const daysCount = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysCount; d++) {
        days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
    return dateStr === today();
}

/**
 * Get abbreviated month name
 */
export function getMonthName(month: number, short = false): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return short ? months[month - 1].slice(0, 3) : months[month - 1];
}

/**
 * Get day of week abbreviation (Mon, Tue, etc.)
 */
export function getDayOfWeek(dateStr: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
}

/**
 * Friendly display: "Today", "Yesterday", or formatted date
 */
export function friendlyDate(dateStr: string): string {
    if (dateStr === today()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === formatDate(yesterday)) return 'Yesterday';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Current hour (0-23)
 */
export function currentHour(): number {
    return new Date().getHours();
}

/**
 * Format reminder time for display (e.g. "20:00" -> "8:00 PM")
 */
export function formatReminderTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
