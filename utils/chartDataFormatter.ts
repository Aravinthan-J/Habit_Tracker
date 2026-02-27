/**
 * Format completion data for LineChart (rate over 30 days)
 */
export function formatCompletionRateData(
    dates: string[],
    ratesByDate: Record<string, number>
): { labels: string[]; datasets: Array<{ data: number[] }> } {
    const step = Math.ceil(dates.length / 7);
    const labels = dates
        .filter((_, i) => i % step === 0)
        .map((d) => {
            const date = new Date(d);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

    const data = dates.map((d) => Math.round(ratesByDate[d] ?? 0));

    return { labels, datasets: [{ data }] };
}

/**
 * Format step data for BarChart (last 7 days)
 */
export function formatStepData(
    days: string[],
    stepsByDate: Record<string, number>
): { labels: string[]; datasets: Array<{ data: number[] }> } {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
        labels: days.map((d) => dayNames[new Date(d).getDay()]),
        datasets: [{ data: days.map((d) => stepsByDate[d] ?? 0) }],
    };
}

/**
 * Format habit completion counts for DonutChart
 */
export function formatDonutData(completed: number, total: number) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { pct, completed, total };
}
