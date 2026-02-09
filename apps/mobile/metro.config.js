const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Add empty polyfills for Node.js core modules
config.resolver.extraNodeModules = {
  crypto: path.resolve(projectRoot, 'polyfills/empty.js'),
  stream: path.resolve(projectRoot, 'polyfills/empty.js'),
  http: path.resolve(projectRoot, 'polyfills/empty.js'),
  https: path.resolve(projectRoot, 'polyfills/empty.js'),
  http2: path.resolve(projectRoot, 'polyfills/empty.js'),
  url: require.resolve('react-native-url-polyfill'),
  zlib: path.resolve(projectRoot, 'polyfills/empty.js'),
  util: path.resolve(projectRoot, 'polyfills/empty.js'),
  assert: path.resolve(projectRoot, 'polyfills/empty.js'),
  buffer: path.resolve(projectRoot, 'polyfills/empty.js'),
};

// 4. Force axios to use browser/esm build
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 5. Custom resolver to force axios to use browser build and resolve workspace packages
const { resolve: defaultResolve } = require('metro-resolver');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect axios imports to the browser build
  if (moduleName === 'axios') {
    return {
      filePath: path.resolve(workspaceRoot, 'node_modules/axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }

  // Resolve workspace packages directly to their source files
  if (moduleName.startsWith('@habit-tracker/')) {
    const packageName = moduleName.replace('@habit-tracker/', '');
    const srcPath = path.resolve(workspaceRoot, 'packages', packageName, 'src/index.ts');
    const fs = require('fs');
    if (fs.existsSync(srcPath)) {
      return {
        filePath: srcPath,
        type: 'sourceFile',
      };
    }
  }

  // Use default Metro resolver for everything else
  return defaultResolve(context, moduleName, platform);
};

module.exports = config;
