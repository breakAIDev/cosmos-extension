module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      allowlist: ['MIXPANEL_TOKEN'],
      safe: false,
      allowUndefined: false,
    }],
    ['module-resolver', {
      alias: {
        crypto: './src/utils/crypto', // <-- key line
        // '@aptos-labs/aptos-client': '@aptos-labs/aptos-client/dist/web/index.web.js',
        'axios/dist/node/axios.cjs': 'axios',
      },
    }],
    '@babel/plugin-transform-export-namespace-from',
    // 'react-native-reanimated/plugin', // leave LAST if enabled
  ],
};
