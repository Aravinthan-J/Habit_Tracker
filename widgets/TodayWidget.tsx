import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetSnapshot } from './snapshot';

// Widgets render outside the app, so colors are a fixed dark palette
// (with the user's accent pulled from the snapshot).
const BG = '#1A1A2E';
const CARD = '#252540';
const TEXT = '#FFFFFF';
const MUTED = '#A0A0C0';
const DONE_BG = '#10B981';

const MAX_ROWS = 6;

export function TodayWidget({ data }: { data: WidgetSnapshot }) {
  const accent = (data.accent || '#6C63FF') as `#${string}`;
  const habits = data.habits.slice(0, MAX_ROWS);
  const more = data.habits.length - habits.length;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: BG,
        borderRadius: 18,
        padding: 14,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <TextWidget text="Today's Habits" style={{ fontSize: 14, fontWeight: 'bold', color: TEXT }} />
        <TextWidget
          text={`${data.done}/${data.total}`}
          style={{ fontSize: 13, fontWeight: 'bold', color: accent }}
        />
      </FlexWidget>

      {habits.length === 0 ? (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
          <TextWidget text="Tap to add habits" style={{ fontSize: 13, color: MUTED }} />
        </FlexWidget>
      ) : (
        habits.map((h) => (
          <FlexWidget
            key={h.id}
            clickAction="TOGGLE"
            clickActionData={{ habitId: h.id }}
            style={{
              flexDirection: 'row',
              width: 'match_parent',
              alignItems: 'center',
              backgroundColor: CARD,
              borderRadius: 10,
              paddingVertical: 7,
              paddingHorizontal: 9,
              marginBottom: 5,
            }}
          >
            <FlexWidget
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                marginRight: 9,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: h.done ? DONE_BG : '#3A3A55',
              }}
            >
              <TextWidget text={h.done ? '✓' : ' '} style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }} />
            </FlexWidget>
            <TextWidget text={h.icon || '•'} style={{ fontSize: 14, color: TEXT, marginRight: 6 }} />
            <TextWidget
              text={h.title}
              maxLines={1}
              style={{ fontSize: 13, color: h.done ? MUTED : TEXT }}
            />
          </FlexWidget>
        ))
      )}

      {more > 0 && (
        <TextWidget text={`+${more} more`} style={{ fontSize: 11, color: MUTED, marginTop: 2 }} />
      )}
    </FlexWidget>
  );
}
