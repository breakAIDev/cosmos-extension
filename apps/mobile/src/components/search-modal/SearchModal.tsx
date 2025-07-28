import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import {
  getFilteredDapps,
  useFetchDappListForQuickSearch,
  useGetQuickSearchOptions,
  useChainInfo,
  useGetChains,
  useActiveWallet,
  OptionPlatformConfig,
} from '@leapwallet/cosmos-wallet-hooks';
import { WALLETTYPE } from '@leapwallet/leap-keychain';
import { Colors } from '../../theme/colors';
import { searchModalStore } from '../../context/search-modal-store';
import { hideAssetsStore } from '../../context/hide-assets-store';
import { globalSheetsStore } from '../../context/global-sheets-store';
import { isLedgerEnabled } from '../../utils/isLedgerEnabled';
import { QuickSearchOptions } from './QuickSearchOptions';
import { LoaderAnimation } from '../loader/Loader';
import { AlertStrip } from '../alert-strip';
import { useHardCodedActions } from './useHardCodedActions';

const { width } = Dimensions.get('window');

const SearchModalView = () => {
  const navigation = useNavigation();
  const { data: dappsList } = useFetchDappListForQuickSearch();
  const activeChain = useActiveChain();
  const chain = useChainInfo();
  const chains = useGetChains();
  const activeWallet = useActiveWallet();
  const { data: suggestions, status } = useGetQuickSearchOptions();
  const [searchedText, setSearchedText] = useState('');
  const [showModal, setShowModal] = useState(false);

  const {
    alertMessage,
    showAlert,
    setAlertMessage,
    setShowAlert,
    handleConnectLedgerClick,
    handleCopyAddressClick,
    handleLockWalletClick,
    handleSwapClick,
    handleNftsClick,
  } = useHardCodedActions();

  const activeSuggestions = useMemo(() => {
    return (
      suggestions?.filter(({ visible_on }) => {
        return (
          (visible_on.platforms.includes('All') || visible_on.platforms.includes('Extension')) &&
          (visible_on.chains.includes('All') || visible_on.chains.includes(activeChain))
        );
      }) ?? []
    );
  }, [activeChain, suggestions]);

  const filteredSuggestions = useMemo(() => {
    if (searchedText.trim()) {
      const _filteredSuggestions =
        activeSuggestions.filter(({ action_name, show_in_search }) =>
          action_name.toLowerCase().includes(searchedText.trim().toLowerCase()) && show_in_search,
        ) ?? [];

      let _filteredDapps = [];

      if (dappsList?.dapps?.length) {
        _filteredDapps = getFilteredDapps(dappsList.dapps, dappsList.types, searchedText);
      }

      return [..._filteredSuggestions, ..._filteredDapps];
    }

    return activeSuggestions.filter((s) => s.show_in_list);
  }, [activeSuggestions, dappsList, searchedText]);

  const handleNoRedirectActions = (actionName: string) => {
    switch (actionName) {
      case 'Swap':
        handleSwapClick(undefined, '/swap?pageSource=quickSearch');
        break;
      case 'Connect Ledger':
        handleConnectLedgerClick();
        break;
      case 'Copy Address':
        if (
          activeWallet &&
          !(activeWallet.walletType === WALLETTYPE.LEDGER &&
            isLedgerEnabled(chain?.key, chain?.bip44?.coinType, Object.values(chains)))
        ) {
          handleCopyAddressClick();
        }
        break;
      case 'Lock Wallet':
        handleLockWalletClick();
        break;
      case 'Hide Balances':
        hideAssetsStore.setHidden(!hideAssetsStore.isHidden);
        setAlertMessage(`Balances ${!hideAssetsStore.isHidden ? 'Hidden' : 'Visible'}`);
        setShowAlert(true);
        break;
      case 'Settings':
        globalSheetsStore.toggleSideNav();
        break;
    }
  };

  const handleOptionClick = (config: OptionPlatformConfig, index: number, actionName: string) => {
    setShowModal(false);

    switch (config.action_type) {
      case 'no-redirect':
        handleNoRedirectActions(actionName);
        break;
      case 'redirect-external':
        config.redirect_url && Linking.openURL(config.redirect_url);
        break;
      case 'redirect-internal':
        if (actionName === 'View NFTs') {
          handleNftsClick();
        } else {
          navigation.navigate('InternalWebview', {
            uri: `${config.redirect_url}?pageSource=quickSearch`,
          });
        }
        break;
    }
  };

  return (
    <>
      {showModal && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <KeyboardAvoidingView behavior="padding" style={styles.modalWrapper}>
              <View style={styles.modalBox}>
                <TextInput
                  placeholder="Search commands, pages, and dApps"
                  placeholderTextColor="#aaa"
                  value={searchedText}
                  onChangeText={setSearchedText}
                  style={styles.searchInput}
                  autoFocus
                />
                <View style={{ flex: 1 }}>
                  {status === 'loading' && (
                    <View style={styles.loaderWrapper}>
                      <LoaderAnimation color="" />
                    </View>
                  )}
                  {status === 'success' && (
                    <QuickSearchOptions
                      suggestionsList={filteredSuggestions}
                      activeSearchOption={searchModalStore.activeOption.active}
                      handleOptionClick={handleOptionClick}
                    />
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      )}

      {showAlert && (
        <AlertStrip
          message={alertMessage}
          bgColor={Colors.green600}
          onHide={() => {
            setShowAlert(false);
            setAlertMessage('');
          }}
          timeOut={1500}
        />
      )}
    </>
  );
};

export const SearchModal = observer(SearchModalView);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    width: width * 0.9,
    maxHeight: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalBox: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
