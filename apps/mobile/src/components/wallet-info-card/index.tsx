import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, LayoutAnimation, Animated } from 'react-native';
import { CaretDown, CheckCircle } from 'phosphor-react-native';
import { Checkbox } from '../ui/check-box';
import { Skeleton } from '../ui/skeleton';
import { getChainImage } from '../../../assets/images/logos';
import { useBalances } from './use-balances';
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { getDerivationPathToShow } from '../../utils';
import Clipboard from '@react-native-clipboard/clipboard';

type WalletInfoCardPrps = {
  walletName: string;
  index: number;
  onSelectChange: (id: number, flag: boolean) => void;
  isExistingAddress: boolean;
  isLedger?: boolean;
  isChosen: boolean;
  showDerivationPath?: boolean;
  path?: string;
  name?: string;
  cosmosAddress?: string;
  evmAddress?: string;
  bitcoinAddress?: string;
  moveAddress?: string;
  solanaAddress?: string;
  suiAddress?: string;
  className?: string;
};

function WalletInfoCard({
  walletName,
  index,
  onSelectChange,
  showDerivationPath = false,
  isExistingAddress,
  isLedger,
  isChosen,
  path,
  cosmosAddress,
  evmAddress,
  bitcoinAddress,
  moveAddress,
  solanaAddress,
  suiAddress,
  ...props
}: WalletInfoCardPrps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, nonZeroData, zeroBalance, isLoading } = useBalances({
    cosmosAddress,
    bitcoinAddress,
    moveAddress,
    evmAddress,
    solanaAddress,
    suiAddress,
  });

  const balances = zeroBalance ? data : nonZeroData;

  const derivationPath = useMemo(() => getDerivationPathToShow(path ?? ''), [path]);

  useEffect(() => {
    if (zeroBalance && !isLoading) setIsExpanded(false);
  }, [zeroBalance, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    if (isLedger && isExistingAddress) {
      onSelectChange((path || index) as any, true);
      return;
    }
    onSelectChange((path || index) as any, !zeroBalance);
  }, [zeroBalance, isLoading, index, isLedger, isExistingAddress, onSelectChange, path]);

  const addressesToShow = useMemo(() => (isLedger ? data : balances), [isLedger, data, balances]);

  return (
    <View
      style={[
        styles.card,
        isExistingAddress && !isLedger && styles.cardExisting,
      ]}
      {...props}
    >
      {/* Top Row */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() => {
            if (!addressesToShow || !addressesToShow.length) return;
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsExpanded((prev) => !prev);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.walletName}>{walletName}</Text>
          {showDerivationPath && (
            <Text style={styles.derivationPath}>{derivationPath}</Text>
          )}
          {!isLoading && !!addressesToShow?.length && (
            <CaretDown
              size={16}
              color="#97A3B9"
              style={[
                styles.caret,
                isExpanded && { transform: [{ rotate: '180deg' }] }
              ]}
            />
          )}
          {isExistingAddress && !isLedger && (
            <Text style={styles.existsText}>Already exists</Text>
          )}
        </TouchableOpacity>
        <Checkbox
          disabled={isExistingAddress}
          checked={isChosen}
          onChange={(flag) => onSelectChange((path || index) as any, !!flag)}
          style={{ marginLeft: 'auto' }}
        />
      </View>

      {/* Balance list or skeleton */}
      {isLoading ? (
        <View style={styles.animatedContent}>
          <AddressAndBalanceSkeleton />
        </View>
      ) : (
        isExpanded &&
        addressesToShow &&
        <View style={styles.animatedContent}>
          {addressesToShow.map((chain) => (
            <AddressAndBalanceCard {...chain} chainKey={chain.key} name={chain.name} key={chain.key} />
          ))}
        </View>
      )}
    </View>
  );
}

export default WalletInfoCard;


// ---- AddressText ----
const AddressText = ({ address }: { address: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const opacity = React.useRef(new Animated.Value(1)).current;

  const handleCopy = () => {
    Clipboard.setString(address);
    setIsCopied(true);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => setIsCopied(false), 1400);
    });
  };

  return (
    <TouchableOpacity
      onPress={handleCopy}
      activeOpacity={0.7}
      style={styles.addressContainer}
      disabled={isCopied}
    >
      {isCopied ? (
        <Animated.View style={[styles.addressRow, { opacity }]}>
          <CheckCircle size={16} color="#26c06f" />
          <Text style={styles.copiedText}>Copied</Text>
        </Animated.View>
      ) : (
        <Text style={styles.addressText}>{sliceAddress(address)}</Text>
      )}
    </TouchableOpacity>
  );
};

// ---- AddressAndBalanceCard ----
const AddressAndBalanceCard = ({
  name,
  chainKey,
  denom,
  address,
  amount,
}: {
  name: string;
  chainKey: string;
  denom: string;
  address?: string;
  amount: string;
}) => (
  <View style={styles.addrRow}>
    <Image
      source={getChainImage(chainKey)}
      style={styles.tokenLogo}
      resizeMode="contain"
    />
    <View style={styles.addrInfo}>
      <Text style={styles.addrName}>{name}</Text>
      <Text style={styles.addrAmount}>{amount} {denom}</Text>
    </View>
    {address && (
      <View style={styles.copyBtn}>
        <AddressText address={address} />
      </View>
    )}
  </View>
);

// ---- AddressAndBalanceSkeleton ----
const AddressAndBalanceSkeleton = () => (
  <View style={styles.addrRow}>
    <Skeleton width={36} height={36} borderRadius={18} style={{ marginRight: 8 }} />
    <View style={styles.addrInfo}>
      <Skeleton width={64} height={10} borderRadius={4} style={{ marginBottom: 6 }} />
      <Skeleton width={50} height={8} borderRadius={4} />
    </View>
    <Skeleton width={80} height={12} borderRadius={4} style={{ marginLeft: 'auto' }} />
  </View>
);

export const AddressAndBalanceCardSkeleton = ({ walletName }: { walletName: string }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.walletName}>{walletName}</Text>
        <Checkbox disabled style={styles.checkbox} checked={false} onChange={function (flag: boolean): void {   } } />
      </View>
      <View style={styles.divider} />
      <AddressAndBalanceSkeleton />
    </View>
  );
};

// ---- SelectWalletsLabel ----
export const SelectWalletsLabel = ({ count, total, onSelectAllToggle }: {
  count: number;
  total: number;
  onSelectAllToggle: (flag: boolean) => void;
}) => (
  <View style={styles.labelContainer}>
    <Text style={styles.selectedText}>
      {count} {count === 1 ? 'wallet' : 'wallets'} selected
    </Text>
    <View style={styles.labelRight}>
      <Text style={styles.selectAllText}>Select All</Text>
      <Checkbox checked={count === total} onChange={onSelectAllToggle} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  addressContainer: {
    marginLeft: 'auto',
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    color: '#97A3B9',
    fontWeight: 'bold',
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#F3F7F6',
    width: '100%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardExisting: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  walletName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#232323',
  },
  checkbox: {
    marginLeft: 'auto',
  },
  divider: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#B8C2CC80', // border-secondary-600/50
  },
  derivationPath: {
    fontSize: 11,
    fontWeight: '500',
    backgroundColor: '#E6EAEF',
    color: '#232323',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  caret: {
    marginLeft: 6,
  },
  existsText: {
    fontSize: 11,
    fontWeight: '500',
    backgroundColor: '#E6EAEF',
    color: '#232323',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  animatedContent: {
    borderTopWidth: 1,
    borderColor: '#B8C2CC80',
    overflow: 'hidden',
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#B8C2CC40',
  },
  tokenLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6EAEF',
    marginRight: 8,
  },
  addrInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  addrName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#232323',
    textTransform: 'capitalize',
  },
  addrAmount: {
    fontSize: 12,
    color: '#97A3B9',
    fontWeight: '500',
  },
  copyBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    paddingLeft: 6,
  },
  copied: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copiedText: {
    color: '#26c06f',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  labelContainer: {
    backgroundColor: '#F3F7F6',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 12,
  },
  selectedText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#232323',
  },
  labelRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#97A3B9',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
});
