const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `node_modules` in the monorepo root
config.resolver.disableHierarchicalLookup = true;

// 4. Add the monorepo paths to the resolver.
config.resolver.extraNodeModules = {
    '@habit-tracker/shared-types': path.resolve(workspaceRoot, 'packages/shared-types/dist'),
    '@habit-tracker/shared-utils': path.resolve(workspaceRoot, 'packages/shared-utils/src'),
    '@habit-tracker/api-client': path.resolve(workspaceRoot, 'packages/api-client/dist'),
};

module.exports = config;

