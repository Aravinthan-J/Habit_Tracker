import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WeeklyReviewStats } from '@/utils/weeklyReview';

/** Render the weekly review as a shareable card (PDF) and open the share sheet. */
export async function shareWeeklyReviewCard(stats: WeeklyReviewStats, userName: string): Promise<void> {
    const deltaText = stats.delta === 0
        ? 'same as last week'
        : `${stats.delta > 0 ? '▲' : '▼'} ${Math.abs(stats.delta)}% vs last week`;
    const deltaColor = stats.delta >= 0 ? '#4CAF50' : '#FF6584';

    const streakRows = stats.topStreaks
        .map((s) => `<div class="row"><span>🔥 ${s.title}</span><b>${s.streak} days</b></div>`)
        .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { margin: 0; padding: 24px; background: #0F0F1A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
            .card { background: linear-gradient(160deg, #1E1E35, #15152A); border-radius: 24px; padding: 32px; color: #FFF; border: 1px solid rgba(255,255,255,0.08); }
            .brand { color: #6C63FF; font-weight: 800; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
            h1 { font-size: 26px; margin: 8px 0 2px; }
            .range { color: #A0A0C0; font-size: 13px; margin-bottom: 24px; }
            .hero { font-size: 64px; font-weight: 800; color: #8B84FF; line-height: 1; }
            .hero-label { color: #A0A0C0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
            .delta { color: ${deltaColor}; font-size: 14px; font-weight: 600; margin-top: 4px; }
            .grid { display: flex; gap: 12px; margin: 24px 0; }
            .stat { flex: 1; background: rgba(255,255,255,0.05); border-radius: 14px; padding: 14px; }
            .stat b { display: block; font-size: 22px; }
            .stat span { color: #A0A0C0; font-size: 11px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
            .highlight { background: rgba(108,99,255,0.12); border-radius: 14px; padding: 14px; margin-bottom: 10px; font-size: 14px; }
            .footer { text-align: center; color: #606080; font-size: 11px; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">Habity</div>
            <h1>${userName}'s Week in Review</h1>
            <div class="range">${stats.rangeLabel}</div>

            <div class="hero">${stats.completionRate}%</div>
            <div class="hero-label">Completion rate</div>
            <div class="delta">${deltaText}</div>

            <div class="grid">
              <div class="stat"><b>${stats.totalCompletions}</b><span>Habits completed</span></div>
              <div class="stat"><b>${stats.perfectDays}</b><span>Perfect days</span></div>
              <div class="stat"><b>${stats.newStreaks.length}</b><span>New streaks</span></div>
            </div>

            ${stats.bestHabit ? `<div class="highlight">🏆 Best habit: <b>${stats.bestHabit.title}</b> — ${stats.bestHabit.count}/7 days</div>` : ''}
            ${stats.worstHabit ? `<div class="highlight">🌱 Needs love: <b>${stats.worstHabit.title}</b> — ${stats.worstHabit.count}/7 days</div>` : ''}

            ${streakRows ? `<div style="margin-top:16px">${streakRows}</div>` : ''}

            <div class="footer">Tracked with Habity</div>
          </div>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({ html, width: 420, height: 640 });
    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share your weekly review',
        });
    }
}
