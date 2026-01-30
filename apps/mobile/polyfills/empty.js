// Empty polyfill for Node.js modules that don't exist in React Native
// Used for modules like crypto, stream, http, https, zlib when axios imports them
// but doesn't actually use them (browser build)
module.exports = {};
