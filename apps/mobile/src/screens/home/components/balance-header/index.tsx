import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Button } from '../../../../components/ui/button';
import { EyeIcon } from '../../../../../assets/icons/eye-icon';
import { observer } from 'mobx-react-lite';
import { MotiView, AnimatePresence } from 'moti';
import { rootBalanceStore } from '../../../../context/root-store';
import { CopyAddress } from './copy-address';
import { TotalBalance } from './total-balance';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';

export const BalanceHeaderLoading = ({ watchWallet }: { watchWallet?: boolean }) => (
  <View style={styles.centeredCol}>
    <View style={styles.row}>
      <Skeleton style={styles.skeletonTitle} />
    </View>
    <Skeleton style={styles.skeletonSubtitle} />
    {watchWallet ? <Skeleton style={styles.skeletonWatch} /> : null}
  </View>
);

export const WatchWalletIndicator = () => (
  <Button
    variant="secondary"
    size="sm"
    style={{ backgroundColor: '#F3F5F7', flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8, marginVertical: 12, alignItems: 'center' }}
    onPress={() => {
      // TODO: open watch wallet popup sheet
    }}
  >
    <EyeIcon size={16} />
    <Text style={{ fontWeight: '500', fontSize: 14 }}>You are watching this wallet</Text>
  </Button>
);

export const BalanceHeader = observer(() => {
  const { activeWallet } = useActiveWallet();
  const watchWallet = activeWallet?.watchWallet;
  const isTokenLoading = rootBalanceStore.loading;

  return (
    <View style={styles.container}>
      <AnimatePresence>
        {isTokenLoading ? (
          <BalanceHeaderLoading key="balance-header-loading" watchWallet={watchWallet} />
        ) : (
          <MotiView
            key="balance"
            style={styles.motiCol}
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 12 }}
            transition={{ type: 'timing', duration: 250 }}
          >
            <TotalBalance />
            <CopyAddress />
            {watchWallet && <WatchWalletIndicator />}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 32, paddingHorizontal: 28, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  motiCol: { flexDirection: 'column', alignItems: 'center', gap: 8 },
  centeredCol: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  row: { height: 49, flexDirection: 'row', alignItems: 'center' },
  skeletonTitle: { width: 176, height: 24, borderRadius: 12 },
  skeletonSubtitle: { height: 16, marginVertical: 6, borderRadius: 8, width: 112 },
  skeletonWatch: { width: 224, height: 32, borderRadius: 16, marginVertical: 8 },
});
