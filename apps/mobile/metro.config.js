const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://facebook.github.io/metro/docs/configuration
 */

const config = {};

// Watch and resolve modules in workspace packages
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

config.watchFolders = [workspaceRoot];

config.resolver = {
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
  extraNodeModules: {
    '@habit-tracker/shared-types': path.resolve(workspaceRoot, 'packages/shared-types/src'),
    '@habit-tracker/shared-utils': path.resolve(workspaceRoot, 'packages/shared-utils/src'),
    '@habit-tracker/api-client': path.resolve(workspaceRoot, 'packages/api-client/src'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
