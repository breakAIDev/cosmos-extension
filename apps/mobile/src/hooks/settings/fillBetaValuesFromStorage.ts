
import Browser, { Storage } from 'webextension-polyfill';

export function fillBetaValuesFromStorage(
  activeChain: string,
  resourceKey: string,
  
  setResource: (param: any) => void,
  defaultResourceData?: any,
) {
  Browser.storage &&
    Browser.storage.local.get([resourceKey]).then((storage) => {
      if (storage[resourceKey] && storage[resourceKey][activeChain]) {
        setResource(storage[resourceKey][activeChain]);
      } else {
        setResource(defaultResourceData);
      }
    });

  const handleStorageChange = (changes: Record<string, Storage.StorageChange>) => {
    if (changes[resourceKey]) {
      const { newValue } = changes[resourceKey];

      if (newValue[activeChain]) {
        setResource(newValue[activeChain]);
      } else {
        setResource(defaultResourceData);
      }
    }
  };

  Browser.storage && Browser.storage.onChanged.addListener(handleStorageChange);

  return () => Browser.storage && Browser.storage.onChanged.removeListener(handleStorageChange);
}
