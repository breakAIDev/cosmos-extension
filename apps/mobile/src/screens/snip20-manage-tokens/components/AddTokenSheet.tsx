import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SecretToken } from '@leapwallet/cosmos-wallet-hooks';
import { CardDivider, GenericCard } from '@leapwallet/leap-ui';
import { CaretRight, ClipboardText, PencilSimple, PlusCircle } from 'phosphor-react-native';
import BottomModal from '../../../components/bottom-modal';
import Text from '../../../components/text';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';

type AddTokenSheetProps = {
  isVisible: boolean;
  onClose: VoidFunction;
  token?: SecretToken;
  onCreateViewingKey: VoidFunction;
  onUpdateViewingKey: VoidFunction;
  onImportViewingKey: VoidFunction;
};

export function AddTokenSheet({
  isVisible,
  onClose,
  token,
  onCreateViewingKey,
  onUpdateViewingKey,
  onImportViewingKey,
}: AddTokenSheetProps) {
  const defaultLogo = useDefaultTokenLogo();

  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title={'Add Token'}>
      <View style={styles.content}>
        <View style={styles.tokenHeader}>
          <Image
            source={{ uri: token?.icon ?? defaultLogo}}
            style={styles.tokenIcon}
          />
          <Text size="xxl" style={styles.tokenSymbol}>
            {token?.symbol}
          </Text>
        </View>
        <Text size="md" style={styles.tokenName}>
          {token?.name}
        </Text>

        <View style={styles.cardContainer}>
          <GenericCard
            onClick={onCreateViewingKey}
            style={styles.cardTop}
            title={token?.snip24Enabled ? 'Create query permit' : 'Create new key'}
            img={<PlusCircle size={16} color="#9CA3AF" style={styles.iconLeft} />}
            icon={<CaretRight size={16} color="#9CA3AF" />}
          />
          <CardDivider />
          <GenericCard
            onClick={onUpdateViewingKey}
            title="Update key"
            img={<PencilSimple size={16} color="#9CA3AF" style={styles.iconLeft} />}
            icon={<CaretRight size={16} color="#9CA3AF" />}
          />
          <CardDivider />
          <GenericCard
            onClick={onImportViewingKey}
            style={styles.cardBottom}
            title={<Text size="md">Import key</Text>}
            img={<ClipboardText size={16} color="#9CA3AF" style={styles.iconLeft} />}
            icon={<CaretRight size={16} color="#9CA3AF" />}
          />
        </View>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    width: '100%',
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 20,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 16,
  },
  tokenSymbol: {
    fontWeight: '600',
  },
  tokenName: {
    fontWeight: 'bold',
    color: '#A1A1AA',
    marginLeft: 20,
    marginBottom: 18,
    marginTop: 0,
  },
  cardContainer: {
    marginHorizontal: 0,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  cardTop: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardBottom: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  iconLeft: {
    marginRight: 12,
  },
});
