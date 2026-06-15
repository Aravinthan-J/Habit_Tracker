import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TodayWidget } from './TodayWidget';
import {
    readWidgetSnapshot,
    saveWidgetSnapshot,
    addPendingToggle,
    WidgetSnapshot,
} from './snapshot';

/**
 * Headless handler invoked by the OS for widget lifecycle + clicks.
 * It only touches AsyncStorage (no DB/Firestore) — taps are recorded as
 * "pending toggles" that the app commits next time it runs (useWidgetSync).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const render = (data: WidgetSnapshot) => props.renderWidget(<TodayWidget data={data} />);

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
            render(await readWidgetSnapshot());
            break;

        case 'WIDGET_CLICK': {
            if (props.clickAction === 'TOGGLE') {
                const habitId = String(props.clickActionData?.habitId ?? '');
                const snap = await readWidgetSnapshot();
                const habit = snap.habits.find((h) => h.id === habitId);
                if (habit) {
                    habit.done = !habit.done;
                    snap.done = snap.habits.filter((h) => h.done).length;
                    await saveWidgetSnapshot(snap);
                    await addPendingToggle({ habitId, date: snap.date, done: habit.done });
                }
                render(snap);
            } else {
                render(await readWidgetSnapshot());
            }
            break;
        }

        case 'WIDGET_DELETED':
        default:
            break;
    }
}
