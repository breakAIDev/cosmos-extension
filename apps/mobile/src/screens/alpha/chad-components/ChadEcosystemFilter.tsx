import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import mixpanel from '../../../mixpanel';

import { EventName, PageName } from '../../../services/config/analytics';
import { useDefaultTokenLogo, useNonNativeCustomChains } from '../../../hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useCoingeckoChains } from '../../../hooks/useCoingeckoChains';
import FilterItem from '../components/FilterItem';
import { useChadProvider } from '../context/chad-exclusives-context';

type EcosystemFilterProps = {
  ecosystemFilters: string[];
  pageName: PageName;
  isChad: boolean;
  onClose: () => void;
};

export default function EcosystemFilter({
  ecosystemFilters,
  pageName,
  isChad,
  onClose,
}: EcosystemFilterProps) {
  const { chains } = useCoingeckoChains();
  const nativeChains = useChainInfos();
  const nonNative = useNonNativeCustomChains();
  const defaultTokenLogo = useDefaultTokenLogo();

  const nativeChainsList = Object.values(nativeChains);
  const nonNativeChainsList = Object.values(nonNative);
  const allChains = [...nativeChainsList, ...nonNativeChainsList];
  const { selectedOpportunities, selectedEcosystems, setEcosystems } = useChadProvider();

  const handleEcosystemToggle = useCallback(
    (ecosystem: string) => {
      try {
        const newEcosystems = selectedEcosystems?.includes(ecosystem)
          ? selectedEcosystems.filter((o) => o !== ecosystem)
          : [...(selectedEcosystems || []), ecosystem];

        setEcosystems(newEcosystems);
        onClose();
        mixpanel.track(EventName.Filters, {
          filterSelected: [...(selectedOpportunities || []), ...(newEcosystems || [])],
          filterApplySource: pageName,
          isChad,
        });
      } catch (err) {
        // ignore
      }
    },
    [selectedOpportunities, selectedEcosystems, setEcosystems, pageName, isChad, onClose],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ecosystem</Text>
      <View style={styles.list}>
        {ecosystemFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((ecosystem, index) => {
            const coingeckoChain = chains.find((chain) =>
              chain.name.toLowerCase().startsWith(ecosystem?.toLowerCase().split(' ')[0]),
            );
            const chain = allChains.find((chain) =>
              chain.chainName.toLowerCase().startsWith(ecosystem?.toLowerCase().split(' ')[0]),
            );

            const icon =
              chain && chain?.chainSymbolImageUrl
                ? chain?.chainSymbolImageUrl
                : coingeckoChain
                ? coingeckoChain?.image?.small || coingeckoChain?.image?.large || defaultTokenLogo
                : defaultTokenLogo;

            return (
              <FilterItem
                key={ecosystem}
                icon={icon}
                label={ecosystem}
                isLast={index === ecosystemFilters.length - 1}
                isSelected={selectedEcosystems?.includes(ecosystem)}
                onSelect={() => handleEcosystemToggle(ecosystem)}
                onRemove={() => handleEcosystemToggle(ecosystem)}
              />
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 10,
  },
  title: {
    color: '#97A3B9', // muted-foreground
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  list: {
    flexDirection: 'column',
  },
});
