import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ArrowLeft, ArrowSquareOut, CaretDown } from 'phosphor-react-native';
import { captureException } from '@sentry/react-native';
import BigNumber from 'bignumber.js';

import { formatTokenAmount, useAddress, useDebounce } from '@leapwallet/cosmos-wallet-hooks';
import { useChainInfos } from '../../hooks/useChainInfos';
import { getConversionRateKado, getQuoteSwapped } from '../../hooks/useGetSwappedDetails';
import { removeLeadingZeroes } from '../../utils/strings';
import { isString } from 'markdown-it/lib/common/utils';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import SelectWallet from '../home/SelectWallet/v2';
import SelectAssetSheet from './components/SelectAssetSheet';
import SelectCurrencySheet from './components/SelectCurrencySheet';
import { convertObjInQueryParams } from '../home/utils';
import { Images } from '../../../assets/images';
import { AssetProps } from '../../hooks/swapped/useGetSupportedAssets';

import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { PageName } from '../../services/config/analytics';
import { uiErrorTags } from '../../utils/sentry';
import { useNavigation, useRoute } from '@react-navigation/native';
import useQuery from '../../hooks/useQuery';

export enum ServiceProviderEnum {
  SWAPPED = 'swapped',
}

export enum ServiceProviderBaseUrlEnum {
  SWAPPED = 'https://widget.swapped.com',
}

export default function Buy() {
  const navigation = useNavigation();
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const pageViewSource = useQuery().get('pageSource') ?? undefined;
  // usePageView(PageName.OnRampQuotePreview, true, pageViewAdditionalProperties)

  const route = useRoute();
  
  const asset: any = route.params;

  const [showSelectCurrencySheet, setShowSelectCurrencySheet] = useState(false);
  const [showSelectTokenSheet, setShowSelectTokenSheet] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedAsset, setSelectedAsset] = useState<AssetProps | undefined>(undefined);
  const selectedAddress = useAddress(selectedAsset?.chainKey);

  const [payFiatAmount, setPayFiatAmount] = useState<string>('0');
  const debouncedPayAmount = useDebounce<string>(payFiatAmount, 500);
  const [fiatAmountInUsd, setFiatAmountInUsd] = useState('0');
  const [getAssetAmount, setGetAssetAmount] = useState<string>('0');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputAmountRef = useRef(null);
  const chains = useChainInfos();

  useEffect(() => {
    async function getQuote() {
      try {
        setLoadingQuote(true);
        const quote = await getQuoteSwapped({
          payment_method: 'credit-card',
          fiat_amount: new BigNumber(debouncedPayAmount).toNumber(),
          fiat_currency: selectedCurrency,
          crypto_currency: selectedAsset?.symbol ?? 'ATOM',
        });
        if (quote.success) {
          setGetAssetAmount(quote?.data?.crypto_amount ?? '0');
        } else {
          setGetAssetAmount('0');
        }
      } catch (error) {
        captureException(error, {
          tags: uiErrorTags,
        });

        const message = error instanceof Error ? error.message : 'An error occurred';
        if (message.toLowerCase().includes('timeout')) {
          setError('Request timed out. Unable to fetch quote.');
        } else {
          setError(message);
        }
      } finally {
        setLoadingQuote(false);
      }
    }
    if (debouncedPayAmount && new BigNumber(debouncedPayAmount).isGreaterThan('0')) {
      getQuote();
    } else {
      setGetAssetAmount('0');
    }
  }, [debouncedPayAmount, selectedAsset, selectedCurrency]);

  useEffect(() => {
    if (inputAmountRef.current) {
      (inputAmountRef.current as HTMLElement)?.focus();
    }
  }, []);

  useEffect(() => {
    if (pageViewSource === PageName.AssetDetails) {
      const chain = chains[asset.chain as SupportedChain];
      setSelectedAsset({
        symbol: asset.symbol,
        chainName: chain.chainName,
        chainId: chain.chainId,
        chainSymbolImageUrl: chain.chainSymbolImageUrl,
        assetImg: asset.img,
        origin: chain.chainName,
        chainKey: chain.key,
        tags: asset?.tags,
      });
    }
  }, [asset, chains, pageViewSource]);

  useEffect(() => {
    if (!selectedAsset) {
      setShowSelectTokenSheet(true);
    }
  }, [selectedAsset]);

  useEffect(() => {
    async function currencyToUsd(amount: string, currency: string) {
      if (currency !== 'USD') {
        const conversionRateToUsd = await getConversionRateKado({
          from: currency,
          to: 'USD',
        });
        const usdAmount = new BigNumber(amount).multipliedBy(conversionRateToUsd);
        setFiatAmountInUsd(usdAmount.toString());
      } else {
        setFiatAmountInUsd(amount);
      }
    }
    currencyToUsd(debouncedPayAmount, selectedCurrency);
  }, [debouncedPayAmount, selectedCurrency]);

  useEffect(() => {
    async function setLimitError() {
      setError(null);
      if (parseFloat(fiatAmountInUsd) > 0) {
        const conversionRate = await getConversionRateKado({
          from: 'USD',
          to: selectedCurrency,
        });
        if (parseFloat(fiatAmountInUsd) < 10) {
          setError(`Amount should be at least ${(10 * conversionRate).toFixed(2)} ${selectedCurrency}`);
        } else if (parseFloat(fiatAmountInUsd) > 10000) {
          setError(`Amount exceeds your daily limit of ${(10000 * conversionRate).toFixed(2)} ${selectedCurrency}`);
        }
      }
    }
    setLimitError();
  }, [fiatAmountInUsd, selectedCurrency]);

  const handleBuyClick = useCallback(() => {
    const params = {
      baseCurrencyAmount: payFiatAmount,
      baseCurrencyCode: selectedCurrency,
      currencyCode: selectedAsset?.tags?.[0] ?? selectedAsset?.symbol,
      walletAddress: selectedAddress,
    };

    const queryParams = convertObjInQueryParams(params);
    const url = `${ServiceProviderBaseUrlEnum.SWAPPED}?${queryParams}`;
    window.open(url, '_blank');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiatAmountInUsd, payFiatAmount, selectedAddress, selectedAsset, selectedCurrency]);

  // Main Render
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={36} color="#222" />
            </TouchableOpacity>
            {/* Custom WalletButtonV2 component as-is */}
          </View>

          {selectedAsset && (
            <View style={{ flex: 1 }}>
              {/* You pay section */}
              <View style={styles.section}>
                <Text style={styles.label}>You pay</Text>
                <View style={styles.inputRow}>
                  <Input
                    value={payFiatAmount}
                    onChangeText={(val) => {
                      setError(null);
                      const amount = removeLeadingZeroes(val);
                      if (parseFloat(amount) < 0) setError('Please enter a valid positive number.');
                      else setPayFiatAmount(amount);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    style={[
                      styles.input,
                      !!error ? styles.inputError : styles.inputNormal,
                    ]}
                    ref={inputAmountRef}
                  />
                  <TouchableOpacity
                    style={styles.currencyButton}
                    onPress={() => setShowSelectCurrencySheet(true)}
                  >
                    {/* Add your currency flag image */}
                    <Text style={styles.currencyText}>{selectedCurrency}</Text>
                    <CaretDown size={14} color="#222" />
                  </TouchableOpacity>
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
                <View style={styles.quickRow}>
                  {[100, 500, 1000].map((amt) => (
                    <TouchableOpacity key={amt} style={styles.quickButton} onPress={() => setPayFiatAmount(String(amt))}>
                      <Text style={styles.quickButtonText}>{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* You get section */}
              <View style={styles.section}>
                <Text style={styles.label}>You get</Text>
                <View style={styles.inputRow}>
                  {loadingQuote ? (
                    <ActivityIndicator style={styles.assetInput} />
                  ) : (
                    <Input
                      value={
                        parseFloat(getAssetAmount) * 10000 > 0
                          ? formatTokenAmount(getAssetAmount, undefined, 4)
                          : getAssetAmount
                      }
                      placeholder="0"
                      style={[styles.input, styles.inputNormal]}
                      editable={false}
                    />
                  )}
                  <TouchableOpacity style={styles.currencyButton} onPress={() => setShowSelectTokenSheet(true)}>
                    {/* Your asset image */}
                    <Text style={styles.currencyText}>{selectedAsset?.symbol}</Text>
                    <CaretDown size={14} color="#222" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Provider row */}
              <View style={styles.providerRow}>
                <Text style={styles.providerLabel}>Provider</Text>
                <View style={styles.providerInfo}>
                  <Image
                    source={{uri: Images.Logos.SwappedLight}}
                    style={styles.providerLogo}
                  />
                  <Text style={styles.providerText}>Swapped</Text>
                </View>
              </View>

              {/* Buy Button */}
              <View style={styles.footer}>
                <Button
                  style={[
                    styles.buyButton,
                    (!new BigNumber(getAssetAmount).isGreaterThan(0) || loadingQuote || isString(error)) && styles.buyButtonDisabled,
                    !!error && styles.buyButtonError,
                  ]}
                  onPress={handleBuyClick}
                  disabled={!new BigNumber(getAssetAmount).isGreaterThan(0) || loadingQuote || isString(error)}
                >
                  {!new BigNumber(getAssetAmount).isGreaterThan(0) ? (
                    'Enter amount'
                  ) : (
                    <View style={styles.buyButtonContent}>
                      <ArrowSquareOut size={20} weight="bold" color="#fff" />
                      <Text style={styles.buyButtonText}>Buy</Text>
                    </View>
                  )}
                </Button>
              </View>
            </View>
          )}

          {/* Modals */}
          <SelectCurrencySheet
            isVisible={showSelectCurrencySheet}
            selectedCurrency={selectedCurrency}
            onClose={() => setShowSelectCurrencySheet(false)}
            onCurrencySelect={(currency) => {
              setSelectedCurrency(currency);
              setShowSelectCurrencySheet(false);
            }}
          />
          <SelectWallet
            isVisible={showSelectWallet}
            onClose={() => {
              setShowSelectWallet(false);
              navigation.navigate('Home');
            }}
            title="Your Wallets"
          />
          <SelectAssetSheet
            isVisible={showSelectTokenSheet}
            selectedAsset={selectedAsset}
            onClose={() => {
              if (!selectedAsset) navigation.goBack();
              else setShowSelectTokenSheet(false);
            }}
            onAssetSelect={(asset) => {
              setSelectedAsset(asset);
              setShowSelectTokenSheet(false);
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  headerIcon: { padding: 8 },
  section: {
    backgroundColor: '#F7F8FA',
    borderRadius: 18,
    margin: 16,
    padding: 20,
    marginBottom: 0,
  },
  label: {
    color: '#888',
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 0,
    height: 44,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  inputNormal: { color: '#1A202C' },
  inputError: { color: '#F44' },
  assetInput: { width: 60, textAlign: 'center' },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  currencyLogo: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  currencyText: { color: '#1A202C', fontSize: 16, fontWeight: '500', marginRight: 2 },
  error: { color: '#F44', fontSize: 12, paddingTop: 6, fontWeight: '500' },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  quickButton: {
    backgroundColor: '#ECEFF3',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  quickButtonText: { fontSize: 13, color: '#888', fontWeight: '500' },
  providerRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 16 },
  providerLabel: { color: '#888', fontWeight: '500', fontSize: 15 },
  providerInfo: { flexDirection: 'row', alignItems: 'center' },
  providerLogo: { width: 20, height: 20, marginRight: 6 },
  providerText: { color: '#222', fontWeight: '600', fontSize: 15 },
  footer: { padding: 20 },
  buyButton: {
    backgroundColor: '#1880FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buyButtonDisabled: { backgroundColor: '#D4D4D4' },
  buyButtonError: { backgroundColor: '#F44' },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  buyButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});