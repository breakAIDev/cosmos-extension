import { useGetStorageLayer } from '@leapwallet/cosmos-wallet-hooks';
import { EARN_USDN_HIGHLIGHT_SHOW } from '../services/config/storage-keys';
import { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

export default function useEarnHighlightFeature() {
  const storage = useGetStorageLayer();
  const [showFeature, setShowFeature] = useState(false);
  const version = DeviceInfo.getVersion(); // e.g., "0.19.1"

  async function hideFeature() {
    await storage.set(EARN_USDN_HIGHLIGHT_SHOW + version, 'false');
    setShowFeature(false);
  }

  useEffect(() => {
    const checkStorage = async () => {
      const show = await storage.get(EARN_USDN_HIGHLIGHT_SHOW + version);
      if (show !== 'false' && version === '0.19.1') {
        setShowFeature(true);
      } else {
        setShowFeature(false);
      }
    };

    const timeout = setTimeout(checkStorage, 3000);
    return () => clearTimeout(timeout);
  }, [storage, version]);

  return { showFeature, hideFeature };
}
