export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getTodayStr = (): string => {
    return formatDate(new Date());
};

export const getDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};
