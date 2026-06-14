import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, SPACING, RADIUS, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate, today } from '@/utils/dateHelpers';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
    completionDates: string[];
    color: string;
}

/** A current-month calendar heatmap: completed days filled with the habit color. */
export const HabitMonthHeatmap: React.FC<Props> = ({ completionDates, color }) => {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);
    const done = useMemo(() => new Set(completionDates), [completionDates]);
    const todayStr = today();

    const { weeks, label } = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startDow = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells: (string | null)[] = [];
        for (let i = 0; i < startDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(formatDate(new Date(year, month, d)));
        while (cells.length % 7 !== 0) cells.push(null);

        const w: (string | null)[][] = [];
        for (let i = 0; i < cells.length; i += 7) w.push(cells.slice(i, i + 7));
        return { weeks: w, label: `${MONTHS[month]} ${year}` };
    }, []);

    return (
        <View style={[styles.card, { backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }]}>
            <Text style={[styles.month, { color: COLORS.textPrimary }]}>{label}</Text>

            <View style={styles.row}>
                {DOW.map((d, i) => (
                    <Text key={i} style={[styles.dowLabel, { color: COLORS.textMuted }]}>{d}</Text>
                ))}
            </View>

            {weeks.map((week, wi) => (
                <View key={wi} style={styles.row}>
                    {week.map((date, di) => {
                        if (!date) return <View key={di} style={styles.cell} />;
                        const isDone = done.has(date);
                        const isToday = date === todayStr;
                        const isFuture = date > todayStr;
                        const dayNum = Number(date.slice(8, 10));
                        return (
                            <View key={di} style={styles.cell}>
                                <View
                                    style={[
                                        styles.day,
                                        { backgroundColor: isDone ? color : COLORS.surface },
                                        isFuture && { opacity: 0.4 },
                                        isToday && { borderWidth: 1.5, borderColor: color },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            { color: isDone ? '#FFFFFF' : COLORS.textMuted },
                                        ]}
                                    >
                                        {dayNum}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const makeStyles = (COLORS: ThemeColors) => StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    month: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, marginBottom: SPACING.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 } as any,
    dowLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: TYPOGRAPHY.medium },
    cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
    day: {
        width: 34,
        height: 34,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: { fontSize: 12, fontWeight: TYPOGRAPHY.medium },
});
