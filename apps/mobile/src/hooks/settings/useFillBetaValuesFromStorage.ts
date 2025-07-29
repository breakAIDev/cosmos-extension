import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';

export function useFillBetaValuesFromStorage(
  activeChain: string,
  resourceKey: string,
  setResource: (value: any) => void,
  defaultResourceData: any
) {
  // Function to fetch the data and set it
  const fetchResource = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(resourceKey);
      const storage = json ? JSON.parse(json) : {};
      if (activeChain !== '' && storage && storage[activeChain]) {
        setResource(storage[activeChain]);
      } else {
        setResource(defaultResourceData);
      }
    } catch (err) {
      setResource(defaultResourceData);
    }
  }, [activeChain, resourceKey, setResource, defaultResourceData]);

  // Fetch on mount & when activeChain/resourceKey changes
  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  // Return a way to refresh manually
  return fetchResource;
}
