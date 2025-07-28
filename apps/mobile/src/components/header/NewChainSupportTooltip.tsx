import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { useTheme } from '@leapwallet/leap-ui';
import * as Sentry from '@sentry/react-native';

import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../hooks/useChainInfos';
import useNewChainTooltip from '../../hooks/useNewChainTooltip';
import AddFromChainStore from '../../screens/home/AddFromChainStore';
import { AggregatedSupportedChain } from '../../types/utility';
import { uiErrorTags } from '../../utils/sentry';

const NewChainSupportTooltip = () => {
  const { toolTipData, handleToolTipClose, showToolTip } = useNewChainTooltip();
  const [newChain, setNewChain] = useState<string | null>(null);

  const navigation = useNavigation();
  const customChains = useCustomChains();
  const chainInfos = useChainInfos();
  const setActiveChain = useSetActiveChain();
  const { theme } = useTheme();

  const handleAddChainClick = useCallback(
    (chain: string) => {
      const item = customChains.find((customChain) => customChain.chainRegistryPath === chain);
      let chainKey;

      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (chainInfo.chainRegistryPath === item?.chainRegistryPath || chainInfo.key === item?.chainRegistryPath) {
          chainKey = key;
          break;
        }
      }

      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain, item);
      } else if (item) {
        setNewChain(item.chainName);
      } else {
        Sentry.captureException(`${chain} chain not found when clicked on tooltip`, {
          tags: uiErrorTags,
        });
      }
    },
    [chainInfos, customChains, setActiveChain],
  );

  const handleSwitchChainClick = useCallback(
    (chainRegistryPath: string) => {
      let chainKey;

      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (chainInfo.chainRegistryPath === chainRegistryPath || chainInfo.key === chainRegistryPath) {
          chainKey = key;
          break;
        }
      }

      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain);
      } else {
        Sentry.captureException(`${chainRegistryPath} chain not found when clicked on banners`, {
          tags: uiErrorTags,
        });
      }
    },
    [chainInfos, setActiveChain],
  );

  const handleCTAClick = useCallback(() => {
    handleToolTipClose();

    switch (toolTipData?.ctaAction?.type) {
      case 'redirect-internally': {
        navigation.navigate('WebViewScreen', {
          uri: `${toolTipData?.ctaAction.redirectUrl}&toolTipId=${toolTipData?.id}`,
        });
        break;
      }
      case 'redirect-externally': {
        Linking.openURL(toolTipData?.ctaAction.redirectUrl);
        break;
      }
      case 'add-chain': {
        handleAddChainClick(toolTipData?.ctaAction.chainRegistryPath);
        break;
      }
      case 'switch-chain': {
        handleSwitchChainClick(toolTipData?.ctaAction.chainRegistryPath);
        break;
      }
      default: {
        navigation.navigate('Home', { openChainSwitch: true });
        break;
      }
    }
  }, [toolTipData, handleToolTipClose]);

  if (!showToolTip || !toolTipData) return null;

  return (
    <View style={styles.tooltipContainer}>
      {toolTipData?.imgUrl && (
        <Image
          source={{ uri: toolTipData.imgUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.header}>{toolTipData.header}</Text>
        <Text style={styles.description}>{toolTipData.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCTAClick} style={styles.ctaButton}>
          <Text style={styles.ctaText}>{toolTipData.ctaText}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToolTipClose}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <AddFromChainStore
        isVisible={!!newChain}
        onClose={() => setNewChain(null)}
        newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: 300,
    elevation: 4,
    position: 'absolute',
    top: 60,
    right: 10,
    zIndex: 100,
  },
  image: {
    width: '100%',
    height: 72,
    borderRadius: 8,
    marginBottom: 10,
  },
  textContainer: {
    marginBottom: 12,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#111',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#16a34a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
});

export default NewChainSupportTooltip;
