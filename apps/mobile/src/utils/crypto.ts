// Minimal shim so packages that `import 'crypto'` can find a WebCrypto-like object.
export const webcrypto = {
  getRandomValues: (arr: any) => {
    // react-native-get-random-values attaches global.crypto
    if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
      throw new Error('getRandomValues is not available. Did you import "react-native-get-random-values" first?');
    }
    return global.crypto.getRandomValues(arr);
  },
};
