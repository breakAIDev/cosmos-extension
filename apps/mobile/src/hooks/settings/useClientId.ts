import { useEffect } from 'react';
import { ClientIdStore } from '../../context/client-id-store';

export function useInitClientId(store: ClientIdStore) {
  useEffect(() => {
    store.initClientId();
  }, [store]);
}
