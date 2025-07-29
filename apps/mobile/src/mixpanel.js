import Mixpanel from 'mixpanel-react-native';
import { MIXPANEL_TOKEN } from '@env';

const mixpanel = new Mixpanel(MIXPANEL_TOKEN);
mixpanel.init();
export default mixpanel;
