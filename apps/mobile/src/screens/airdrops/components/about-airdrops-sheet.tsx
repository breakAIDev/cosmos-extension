import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Info } from 'phosphor-react-native'; // Or use a react-native compatible icon lib
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import GoToLeapboard from './GoToLeapboard';

type AboutAirdropsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AboutAirdropsSheet: React.FC<AboutAirdropsSheetProps> = ({ isOpen, onClose }) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="About Airdrops">
      <Text
        size="sm"
        style={[styles.grayText, styles.medium, { marginBottom: 12 }]}
      >
        Only active airdrops that Leap has partnered with for eligibility tracking are displayed here. For information on other airdrops, visit our Leap Dashboard.
      </Text>

      <GoToLeapboard />

      <View style={styles.disclaimerHeader}>
        {/* If you use react-native-vector-icons or similar, replace below icon import */}
        <Info size={20} color="#111827" style={{ marginRight: 8 }} />
        <Text size="md" style={styles.bold}>Disclaimer</Text>
      </View>

      <Text
        size="sm"
        style={[styles.grayText, styles.medium]}
      >
        We aggregate airdrops data without endorsing or verifying it. Accuracy, relevance, or timeliness of data not guaranteed. Conduct your own research before engaging.
      </Text>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  grayText: {
    color: '#374151', // text-gray-800
    // Add dark theme if your app supports dynamic styles or themes
  },
  medium: {
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Only supported in RN 0.71+, otherwise use margin
    marginTop: 32,
    marginBottom: 8,
  },
});
