
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MagnifyingGlass } from 'phosphor-react-native';
import { observer } from 'mobx-react-lite';
import { useFeatureFlags, OptionPlatformConfig, QuickSearchOption } from '@leapwallet/cosmos-wallet-hooks';
import { searchModalStore } from '../../context/search-modal-store';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../assets/images';

type Props = {
  suggestionsList: QuickSearchOption[];
  activeSearchOption: number;
  handleOptionClick: (config: OptionPlatformConfig, optionIndex: number, actionName: string) => void;
};

const QuickSearchOptionsView = ({
  suggestionsList,
  activeSearchOption,
  handleOptionClick,
}: Props) => {
  const { data: featureFlags } = useFeatureFlags();
  const isDark = useColorScheme() === 'dark';
  const defaultTokenLogo = useDefaultTokenLogo();

  useEffect(() => {
    if (suggestionsList.length && searchModalStore.enteredOption !== null) {
      const option = suggestionsList[searchModalStore.enteredOption];
      if (option) {
        handleOptionClick(option.extension_config, searchModalStore.enteredOption, option.action_name);
      }
    }
  }, [searchModalStore.enteredOption, suggestionsList]);

  const renderItem = ({ item, index }: { item: QuickSearchOption; index: number }) => {
    if (item.action_name === 'Swap' && featureFlags?.all_chains?.swap === 'disabled') return null;
    if (item.action_name === 'View NFTs' && featureFlags?.nfts?.extension === 'disabled') return null;

    const isActive = index === activeSearchOption;
    const iconSrc = isDark ? item.action_icon_url : item.action_light_icon_url;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.optionItem, isActive && styles.activeOption]}
        onPress={() => handleOptionClick(item.extension_config, index, item.action_name)}
      >
        <Image
          source={{ uri: iconSrc || defaultTokenLogo }}
          style={styles.optionIcon}
          defaultSource={defaultTokenLogo}
        />
        <Text style={[styles.optionText, isDark && styles.optionTextDark]}>{item.action_name}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.tags?.map((tag) => (
            <View key={tag.name} style={[styles.tag, { backgroundColor: tag.background_color }]}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </ScrollView>

        {item.extension_config?.action_type === 'redirect-external' && (
          <Image source={require(Images.Misc.OpenLink)} style={styles.openLinkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  if (!suggestionsList.length) {
    return (
      <View style={styles.noResultContainer}>
        <View style={styles.noResultIconWrapper}>
          <MagnifyingGlass size={30} color="#d1d5db" />
        </View>
        <Text style={[styles.noResultText, isDark && styles.optionTextDark]}>No result found</Text>
        <Text style={styles.noResultSubText}>Try a different search term</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={suggestionsList}
      keyExtractor={(_, index) => `search-option-${index}`}
      renderItem={renderItem}
      style={{ height: 420 }}
      contentContainerStyle={styles.listContent}
    />
  );
};

export const QuickSearchOptions = observer(QuickSearchOptionsView);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 6,
    borderColor: 'transparent',
    borderWidth: 1,
  },
  activeOption: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  optionTextDark: {
    color: '#f3f4f6',
  },
  tag: {
    height: 17,
    borderRadius: 5,
    paddingHorizontal: 4,
    marginLeft: -6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 9,
    color: '#ffffff',
  },
  openLinkIcon: {
    width: 12,
    height: 12,
    marginTop: 6,
    marginLeft: 6,
    tintColor: '#9ca3af',
  },
  noResultContainer: {
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultIconWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    padding: 18,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  noResultSubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
