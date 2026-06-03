const { withMainActivity, withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * react-native-health-connect needs three things that no shipped plugin fully sets up.
 * This keeps them reproducible across `expo prebuild --clean`:
 *
 *  1. MainActivity.onCreate must register the permission-contract delegate, or the
 *     first requestPermission() crashes with:
 *       kotlin.UninitializedPropertyAccessException: lateinit property requestPermission
 *
 *  2. A rationale intent-filter (Android 13 and below) so Health Connect can launch
 *     the app's privacy rationale.
 *
 *  3. An activity-alias handling VIEW_PERMISSION_USAGE / HEALTH_PERMISSIONS
 *     (Android 14+ / API 34+) — REQUIRED for the app to appear in the in-OS
 *     Health Connect permissions list.
 */

const IMPORT = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const CALL = '    HealthConnectPermissionDelegate.setPermissionDelegate(this)';

function withDelegateInMainActivity(config) {
    return withMainActivity(config, (config) => {
        let src = config.modResults.contents;

        if (config.modResults.language !== 'kt') {
            throw new Error('withHealthConnectDelegate only supports a Kotlin MainActivity (.kt).');
        }
        if (!src.includes(IMPORT)) {
            src = src.replace(/(^package .*\n)/m, `$1\n${IMPORT}\n`);
        }
        if (!src.includes('HealthConnectPermissionDelegate.setPermissionDelegate')) {
            src = src.replace(/(super\.onCreate\([^)]*\)\s*\n)/, `$1${CALL}\n`);
        }
        config.modResults.contents = src;
        return config;
    });
}

function withHealthConnectManifest(config) {
    return withAndroidManifest(config, (config) => {
        const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        const activity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);

        // 2. Rationale intent-filter on MainActivity (Android <= 13).
        activity['intent-filter'] = activity['intent-filter'] || [];
        const hasRationale = activity['intent-filter'].some((f) =>
            (f.action || []).some(
                (a) => a.$['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE',
            ),
        );
        if (!hasRationale) {
            activity['intent-filter'].push({
                action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
            });
        }

        // 3. activity-alias for Android 14+ Health Connect discovery.
        app['activity-alias'] = app['activity-alias'] || [];
        const hasAlias = app['activity-alias'].some(
            (a) => a.$['android:name'] === 'ViewPermissionUsageActivity',
        );
        if (!hasAlias) {
            app['activity-alias'].push({
                $: {
                    'android:name': 'ViewPermissionUsageActivity',
                    'android:exported': 'true',
                    'android:targetActivity': '.MainActivity',
                    'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
                },
                'intent-filter': [
                    {
                        action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
                        category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
                    },
                ],
            });
        }

        return config;
    });
}

module.exports = function withHealthConnectDelegate(config) {
    config = withDelegateInMainActivity(config);
    config = withHealthConnectManifest(config);
    return config;
};
