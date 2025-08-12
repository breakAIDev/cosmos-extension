import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { X } from 'phosphor-react-native';
import Text from '../../../components/text';
import { LedgerEvmChains } from '../../../../assets/images/logos';
import { CheckGreenNew } from '../../../../assets/images/misc';
import { Colors } from '../../../theme/colors';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width - 32, 540);

interface ImportEvmModalProps {
  onYes: () => void;
  onNo: () => void;
  onClose: () => void;
}

export default function ImportEvmModal({ onYes, onNo, onClose }: ImportEvmModalProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cosmos import successful</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Cosmos Success */}
        <View style={styles.sectionCenter}>
          <Image source={{uri: CheckGreenNew}} style={styles.checkImg} />
          <Text size="lg" style={styles.boldCenter}>
            Your Cosmos wallets can{'\n'}now be used with Leap!
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* EVM Info */}
        <View style={styles.sectionCenter}>
          <Image source={{uri: LedgerEvmChains}} style={styles.ledgerImg} />
          <Text size="md" style={styles.textCenter}>
            You can now import your EVM based wallets to use{'\n'}chains like Dymension, Evmos & Injective.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Buttons.Generic
            color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray100}
            size="normal"
            style={styles.button}
            onClick={onNo}
          >
            <Text style={{ color: '#22c55e' }}>Skip</Text>
          </Buttons.Generic>
          <Buttons.Generic
            color={Colors.green600}
            size="normal"
            style={styles.button}
            onClick={onYes}
          >
            Import
          </Buttons.Generic>
        </View>

        {/* Bottom text */}
        <View style={styles.sectionCenter}>
          <Text style={styles.bottomNote}>
            You can also import EVM wallets later.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modal: {
    width: MODAL_WIDTH,
    backgroundColor: '#18181B', // bg-gray-950
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#18181B', // border-gray-900
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#FFF',
  },
  closeBtn: {
    padding: 4,
  },
  sectionCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 32,
    gap: 16,
  },
  checkImg: {
    width: 72,
    height: 72,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  boldCenter: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFF',
    fontSize: 18,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#18181B', // bg-gray-900
    width: '100%',
  },
  ledgerImg: {
    width: 88,
    height: 32,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  textCenter: {
    textAlign: 'center',
    color: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomNote: {
    color: '#9CA3AF', // text-gray-400
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
});
