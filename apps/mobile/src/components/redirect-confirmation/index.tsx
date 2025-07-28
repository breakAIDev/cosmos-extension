import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Warning } from 'phosphor-react-native';

type RedirectionConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
};

const RedirectionConfirmationModal: React.FC<RedirectionConfirmationProps> = ({
  isOpen,
  onClose,
  url,
  setUrl,
}) => {
  const handleContinue = () => {
    Linking.openURL(url);
    setUrl('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconWrapper}>
            <Warning size={24} color='white' weight='bold' />
          </View>

          <Text style={styles.message}>
            You will be redirected to an external site. Proceed only if you
            have verified the link.
          </Text>

          <Text style={styles.url}>{url}</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RedirectionConfirmationModal;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  iconWrapper: {
    backgroundColor: '#F87171', // red-300
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  message: {
    color: '#1F2937', // gray-800
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  url: {
    color: '#F87171', // red-300
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    wordBreak: 'break-word',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB', // gray-200
    height: 46,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#111827', // black-100
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#111827', // black-100
    height: 46,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
