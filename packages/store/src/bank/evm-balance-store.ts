import {
  denoms as DefaultDenoms,
  fetchSeiEvmBalances,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import {
  AggregatedChainsStore,
  ChainInfosStore,
  CoingeckoIdsStore,
  CompassSeiEvmConfigStore,
  NmsStore,
  RootDenomsStore,
} from '../assets';
import { AggregatedSupportedChainType, LoadingStatusType, SelectedNetworkType, StorageAdapter } from '../types';
import { balanceCalculator } from '../utils';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { EVMBalanceAPIStore } from './evm-balance-api-store';
import { PriceStore } from './price-store';

export class EvmBalanceStore {
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  addressStore: AddressStore;
  chainInfosStore: ChainInfosStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  rootDenomsStore: RootDenomsStore;
  storageAdapter: StorageAdapter;
  priceStore: PriceStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  evmBalanceApiStore: EVMBalanceAPIStore;
  currencyStore: CurrencyStore;
  coingeckoIdsStore: CoingeckoIdsStore;

  aggregatedLoadingStatus: boolean = false;

  chainWiseEvmBalance: { [key: string]: { evmBalance: Token[]; currencyInFiatValue: BigNumber } } = {};
  chainWiseEvmStatus: { [key: string]: LoadingStatusType } = {};

  constructor(
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    addressStore: AddressStore,
    chainInfosStore: ChainInfosStore,
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore,
    rootDenomsStore: RootDenomsStore,
    storageAdapter: StorageAdapter,
    priceStore: PriceStore,
    aggregatedChainsStore: AggregatedChainsStore,
    nmsStore: NmsStore,
    evmBalanceApiStore: EVMBalanceAPIStore,
    currencyStore: CurrencyStore,
    coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeAutoObservable(this, {
      evmBalance: computed,
    });
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.addressStore = addressStore;
    this.chainInfosStore = chainInfosStore;
    this.compassSeiEvmConfigStore = compassSeiEvmConfigStore;
    this.rootDenomsStore = rootDenomsStore;
    this.storageAdapter = storageAdapter;
    this.priceStore = priceStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.nmsStore = nmsStore;
    this.evmBalanceApiStore = evmBalanceApiStore;
    this.currencyStore = currencyStore;
    this.coingeckoIdsStore = coingeckoIdsStore;
  }

  get evmBalance() {
    return this.evmBalanceForChain(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork);
  }

  evmBalanceForChain(chain: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    if (chain === 'aggregated') {
      let allTokens: Token[] = [];
      const activeNetwork = network ?? this.selectedNetworkStore.selectedNetwork;
      const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
        (chain) =>
          activeNetwork === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      );
      let currencyInFiatValue = new BigNumber(0);

      chains.forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        const evmTokens = this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? [];
        allTokens = allTokens.concat(evmTokens);
        currencyInFiatValue = currencyInFiatValue.plus(
          this.chainWiseEvmBalance[balanceKey]?.currencyInFiatValue ?? new BigNumber(0),
        );
      });

      return {
        evmBalance: sortTokenBalances(allTokens),
        currencyInFiatValue,
        status: 'success',
      };
    }

    const balanceKey = this.getBalanceKey(chain, network);
    return {
      evmBalance: this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? [],
      currencyInFiatValue: this.chainWiseEvmBalance[balanceKey]?.currencyInFiatValue ?? new BigNumber(0),
      status: this.chainWiseEvmStatus[balanceKey] ?? 'success',
    };
  }

  async fetchEvmBalance(chain: SupportedChain, network: SelectedNetworkType, refetch = false, forceFallback = false) {
    const isSeiEvmChain = this.activeChainStore.isSeiEvm(chain);
    const chainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
    const isEvmChain = isSeiEvmChain || chainInfo?.evmOnlyChain;

    const evmBalance: Token[] = [];
    let currencyInFiatValue = new BigNumber(0);

    const balanceKey = this.getBalanceKey(chain, network);

    if (!refetch && this.chainWiseEvmBalance[balanceKey]) {
      return;
    }

    runInAction(() => {
      this.chainWiseEvmStatus[balanceKey] = 'loading';
    });

    try {
      if (isEvmChain) {
        const denoms = this.rootDenomsStore.allDenoms;
        const _nativeTokenKey = Object.keys(chainInfo?.nativeDenoms ?? {})?.[0];
        const nativeToken =
          denoms[_nativeTokenKey] ??
          DefaultDenoms[_nativeTokenKey as SupportedDenoms] ??
          chainInfo?.nativeDenoms?.[_nativeTokenKey];

        const pubKey = this.addressStore.pubKeys?.[chain];
        const chainId =
          (network === 'testnet'
            ? this.chainInfosStore.chainInfos?.[chain]?.evmChainIdTestnet
            : this.chainInfosStore.chainInfos?.[chain]?.evmChainId) ?? '';

        if (!forceFallback) {
          const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
          const { nativeBalances, useFallbackNative } = await this.evmBalanceApiStore.fetchChainBalanceFromAPI(
            chain,
            network,
            ethWalletAddress,
            refetch,
          );

          if (!useFallbackNative) {
            currencyInFiatValue = balanceCalculator(nativeBalances);
            runInAction(() => {
              this.chainWiseEvmBalance[balanceKey] = { evmBalance: nativeBalances, currencyInFiatValue };
              this.chainWiseEvmStatus[balanceKey] = 'success';
            });
            return;
          }
        }

        await this.nmsStore.readyPromise;

        const hasEntryInNms = this.nmsStore?.rpcEndPoints?.[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;

        let evmJsonRpcUrl: string | undefined;
        if (hasEntryInNms) {
          evmJsonRpcUrl = this.nmsStore.rpcEndPoints[chainId][0].nodeUrl;
        }
        if (!evmJsonRpcUrl) {
          evmJsonRpcUrl =
            network === 'testnet'
              ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc
              : chainInfo.apis.evmJsonRpc;
        }

        const fetchEvmBalance = async () => {
          const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];

          if (ethWalletAddress.startsWith('0x') && evmJsonRpcUrl) {
            const balance = await fetchSeiEvmBalances(evmJsonRpcUrl, ethWalletAddress);
            await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);
            const coingeckoPrices = this.priceStore.data;
            const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;
            const coinGeckoId =
              nativeToken?.coinGeckoId ||
              coingeckoIds[nativeToken?.coinMinimalDenom] ||
              coingeckoIds[nativeToken?.coinMinimalDenom?.toLowerCase()] ||
              '';

            let usdValue;
            if (parseFloat(balance.amount) > 0) {
              if (coingeckoPrices) {
                let tokenPrice;

                const alternateCoingeckoKey = `${
                  (this.chainInfosStore.chainInfos?.[nativeToken?.chain as SupportedChain] ?? chainInfo).chainId
                }-${nativeToken?.coinMinimalDenom}`;

                if (coinGeckoId) {
                  tokenPrice = coingeckoPrices[coinGeckoId];
                }

                if (!tokenPrice) {
                  tokenPrice = coingeckoPrices[alternateCoingeckoKey];
                }

                if (tokenPrice) {
                  usdValue = new BigNumber(balance.amount).times(tokenPrice).toString();
                }
              }
            }

            const usdPrice =
              parseFloat(balance.amount) > 0 && usdValue
                ? (parseFloat(usdValue) / parseFloat(balance.amount)).toString()
                : '0';

            evmBalance.push({
              chain: nativeToken?.chain ?? '',
              name: nativeToken?.name,
              amount: balance.amount,
              symbol: nativeToken?.coinDenom,
              usdValue: usdValue ?? '',
              coinMinimalDenom: nativeToken?.coinMinimalDenom,
              img: nativeToken?.icon,
              ibcDenom: '',
              usdPrice,
              coinDecimals: nativeToken?.coinDecimals,
              coinGeckoId,
              tokenBalanceOnChain: chain,
              isEvm: true,
            });
          }
        };

        const storedLinkedAddressState = await this.storageAdapter.get('sei-evm-linked-address-state');
        if (isSeiEvmChain && storedLinkedAddressState) {
          const linkedAddressState = JSON.parse(storedLinkedAddressState);
          const address = this.addressStore.addresses?.[chain];

          if (linkedAddressState[address]?.[chain]?.[network] !== 'done') {
            await fetchEvmBalance();
          }
        } else {
          await fetchEvmBalance();
        }
      }

      currencyInFiatValue = balanceCalculator(evmBalance);
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
        this.chainWiseEvmStatus[balanceKey] = 'success';
      });
    } catch (_) {
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
        this.chainWiseEvmStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, refetch = false) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    const allEvmChains: SupportedChain[] = [];
    const supportedChainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
    await this.aggregatedChainsStore.readyPromise;
    this.aggregatedChainsStore.aggregatedChainsData
      .filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.evmOnlyChain,
      )
      .forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        if (this.chainWiseEvmBalance[balanceKey] && !refetch) {
          runInAction(() => {
            this.chainWiseEvmStatus[balanceKey] = 'success';
          });
          return;
        }
        const pubKey = this.addressStore.pubKeys?.[chain];
        const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
        if (!ethWalletAddress) {
          return;
        }
        allEvmChains.push(chain as SupportedChain);
        supportedChainWiseAddresses[chain as SupportedChain] = ethWalletAddress;
      });

    if (Object.keys(supportedChainWiseAddresses).length === 0) {
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    const balances = await this.evmBalanceApiStore.fetchAggregatedBalanceFromAPI(
      supportedChainWiseAddresses,
      network,
      refetch,
    );
    const chainsToUseFallbackFor: SupportedChain[] = [];

    allEvmChains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain, network);
      if (balances[chain as SupportedChain]?.useFallbackNative) {
        chainsToUseFallbackFor.push(chain);
        return;
      }
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = {
          evmBalance: balances[chain as SupportedChain]?.nativeBalances ?? [],
          currencyInFiatValue: balanceCalculator(balances[chain as SupportedChain]?.nativeBalances ?? []),
        };
        this.chainWiseEvmStatus[balanceKey] = 'success';
      });
    });

    if (chainsToUseFallbackFor.length > 0) {
      await Promise.allSettled(
        this.aggregatedChainsStore.aggregatedChainsData.map((chain) =>
          this.fetchEvmBalance(chain as SupportedChain, network, refetch, true),
        ),
      );
    }

    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  loadEvmBalance(
    _chain?: AggregatedSupportedChainType,
    _network?: SelectedNetworkType,
    refetch = false,
    forceFallback = false,
  ) {
    const chain = _chain || this.activeChainStore.activeChain;
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(network, refetch);
    }

    return this.fetchEvmBalance(chain, network, refetch, forceFallback);
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseEvmStatus[balanceKey] === 'error';
  }

  getAggregatedEvmTokens = computedFn((network: SelectedNetworkType) => {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      const cw20Tokens = Object.values(this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? {});
      allTokens = allTokens.concat(cw20Tokens);
    });

    return sortTokenBalances(allTokens);
  });

  private getBalanceKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address = this.addressStore.addresses[chain as SupportedChain];
    const userPreferredCurrency = this.currencyStore?.preferredCurrency;

    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;
    return `${chain}-${chainId}`;
  }

  private async waitForCoingeckoIdsStore() {
    try {
      await this.coingeckoIdsStore.readyPromise;
    } catch (e) {
      //
    }
  }

  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }
}
