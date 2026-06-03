const { withMainActivity } = require('@expo/config-plugins');

/**
 * react-native-health-connect requires the permission-contract delegate to be
 * registered in MainActivity.onCreate(), otherwise the first requestPermission()
 * call crashes with:
 *   kotlin.UninitializedPropertyAccessException: lateinit property requestPermission
 *
 * No shipped config plugin does this, so we inject it here. This keeps the fix
 * reproducible across `expo prebuild --clean`.
 */
const IMPORT = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const CALL = '    HealthConnectPermissionDelegate.setPermissionDelegate(this)';

module.exports = function withHealthConnectDelegate(config) {
  return withMainActivity(config, (config) => {
    let src = config.modResults.contents;

    if (config.modResults.language !== 'kt') {
      throw new Error(
        'withHealthConnectDelegate only supports a Kotlin MainActivity (.kt).',
      );
    }

    // Add the import after the package declaration (once).
    if (!src.includes(IMPORT)) {
      src = src.replace(/(^package .*\n)/m, `$1\n${IMPORT}\n`);
    }

    // Add the delegate registration right after super.onCreate(...) (once).
    if (!src.includes('HealthConnectPermissionDelegate.setPermissionDelegate')) {
      src = src.replace(/(super\.onCreate\([^)]*\)\s*\n)/, `$1${CALL}\n`);
    }

    config.modResults.contents = src;
    return config;
  });
};
