import { Platform } from 'react-native';

// Android home-screen widget: register the headless task that renders it.
if (Platform.OS === 'android') {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./widgets/taskHandler');
    registerWidgetTaskHandler(widgetTaskHandler);
}

import 'expo-router/entry';
