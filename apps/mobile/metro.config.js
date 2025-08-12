const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // make sure Metro resolves .mjs from ESM packages like cosmjs-types
  config.resolver.sourceExts = Array.from(
    new Set([...(config.resolver.sourceExts || []), 'mjs'])
  );

  // prefer RN/main over module to avoid tricky ESM paths when CJS exists
  config.resolver.resolverMainFields = ['react-native', 'main', 'module'];

  return config;
})();
