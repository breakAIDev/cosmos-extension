import { tryCatchSync } from './try-catch';
import mixpanel from '../mixpanel';

// Type alias for properties
type Dict = { [key: string]: any };

export const mixpanelTrack = (event: string, properties?: Dict) => {
  tryCatchSync(() => mixpanel.track(event, properties));
};
