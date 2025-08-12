import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SecretToken, useSecretTokenStore } from '@leapwallet/cosmos-wallet-hooks';
import { CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui';
import { Plus } from 'phosphor-react-native';
import { EmptyCard } from '../../components/empty-card';
import PopupLayout from '../../components/layout/popup-layout';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../assets/images';
import { sliceSearchWord } from '../../utils/strings';

import { AddTokenSheet, CreateKeySheet, ImportKeySheet } from './components';
import { Snip20ManageTokensProvider } from './context';

export default function SecretManageTokens() {
  const defaultLogo = useDefaultTokenLogo();
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [showAddToken, setShowAddToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState<(SecretToken & { contractAddr: string }) | null>(null);
  const [reviewTx, setReviewTx] = useState(false);
  const [showUpdateViewingKey, setShowUpdateViewingKey] = useState(false);
  const [importKey, setImportKey] = useState(false);

  const contractAddress = useRoute().params?.contractAddress;
  const { secretTokens } = useSecretTokenStore();

  const selectToken = (token: SecretToken & { contractAddr: string }) => {
    setSelectedToken(token);
    setShowAddToken(true);
  };

  useEffect(() => {
    if (contractAddress && secretTokens[contractAddress]) {
      selectToken({ ...secretTokens[contractAddress], contractAddr: contractAddress });
      setShowAddToken(true);
    }
  }, [contractAddress, secretTokens]);

  const handleFilterChange = (text: string) => {
    setSearchText(text);
  };

  const tokensList = useMemo(() => {
    return Object.entries(secretTokens)
      .filter(([contractAddr, tokenData]) => {
        const filterText = searchText.toUpperCase();
        return (
          contractAddr.toUpperCase().includes(filterText) ||
          tokenData.name.toUpperCase().includes(filterText) ||
          tokenData.symbol.toUpperCase().includes(filterText)
        );
      })
      .map(([contractAddr, tokenData]) => {
        return { ...tokenData, contractAddr };
      });
  }, [searchText, secretTokens]);

  const clearState = useCallback(() => {
    setReviewTx(false);
    setShowUpdateViewingKey(false);
    setImportKey(false);
    setShowAddToken(false);
    setSelectedToken(null);
  }, []);

  const handleImportClose = useCallback(() => {
    setImportKey(false);
    setShowUpdateViewingKey(false);
  }, []);

  const handleImportSuccess = useCallback(() => clearState(), [clearState]);
  const handleCreateKeyClose = useCallback(() => setReviewTx(false), []);

  return (
    <Snip20ManageTokensProvider>
      <View style={styles.root}>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => navigation.goBack(),
                type: HeaderActionType.BACK,
              }}
              title="Manage Tokens"
            />
          }
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View style={styles.inputSection}>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="search tokens"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                  value={searchText}
                  onChangeText={handleFilterChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Image source={{uri: Images.Misc.Search}} style={styles.searchIcon} resizeMode="contain" />
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              {tokensList.length === 0 ? (
                <EmptyCard
                  isRounded
                  subHeading={searchText ? 'Please try again with something else' : ''}
                  heading={
                    searchText
                      ? 'No results for “' + sliceSearchWord(searchText) + '”'
                      : 'No Tokens'
                  }
                  src={Images.Misc.Explore}
                />
              ) : null}

              <View style={styles.tokenListPanel}>
                {tokensList.map((tokenData, index, array) => {
                  const isLast = index === array.length - 1;
                  const isFirst = index === 0;

                  return (
                    <React.Fragment key={tokenData.contractAddr}>
                      <GenericCard
                        onClick={() => selectToken(tokenData)}
                        style={[
                          isFirst && { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
                          isLast && { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
                        ]}
                        title={tokenData.symbol}
                        subtitle={tokenData.name}
                        icon={<Plus size={16} color="#9CA3AF" weight="regular" />}
                        img={
                          <Image
                            source={{ uri: tokenData.icon ?? defaultLogo}}
                            style={styles.tokenImg}
                          />
                        }
                      />
                      {!isLast ? <CardDivider /> : null}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </PopupLayout>

        <AddTokenSheet
          isVisible={showAddToken}
          onClose={() => setShowAddToken(false)}
          onCreateViewingKey={() => setReviewTx(true)}
          onUpdateViewingKey={() => setShowUpdateViewingKey(true)}
          onImportViewingKey={() => setImportKey(true)}
          token={selectedToken ?? undefined}
        />

        <CreateKeySheet
          isVisible={reviewTx}
          onClose={handleCreateKeyClose}
          token={selectedToken ?? undefined}
          onSuccess={handleImportSuccess}
        />

        <ImportKeySheet
          isVisible={importKey || showUpdateViewingKey}
          onClose={handleImportClose}
          type={importKey ? 'import' : 'update'}
          token={selectedToken ?? undefined}
          onSuccess={handleImportSuccess}
        />
      </View>
    </Snip20ManageTokensProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  inputSection: {
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 16,
    paddingLeft: 20,
    paddingRight: 12,
    width: 344,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    backgroundColor: 'transparent',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  tokenListPanel: {
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    marginTop: 2,
    marginBottom: 12,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenImg: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
  },
});
