import {
  ChainInfo,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ChainInfosStore, CompassSeiTokensAssociationStore, NmsStore, ZeroStateTokensStore } from '../assets';
import {
  BalanceStore,
  CW20DenomBalanceStore,
  ERC20DenomBalanceStore,
  EvmBalanceStore,
  MarketDataStore,
  PercentageChangeDataStore,
  PriceStore,
} from '../bank';
import { AptosCoinDataStore } from '../bank/aptos-balance-store';
import { sortTokenBalances } from '../bank/balance-calculator';
import { Token } from '../bank/balance-types';
import { BitcoinDataStore } from '../bank/bitcoin-balance-store';
import { SolanaCoinDataStore } from '../bank/solana-balance-store';
import { SuiCoinDataStore } from '../bank/sui-balance-store';
import { ClaimRewardsStore, DelegationsStore, StakeEpochStore, UndelegationsStore, ValidatorsStore } from '../stake';
import { AggregatedSupportedChainType, SelectedNetworkType, SupportedCurrencies } from '../types';
import { isBitcoinChain } from '../utils/is-bitcoin-chain';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';

export class RootStakeStore {
  delegationStore: DelegationsStore;
  claimRewardsStore: ClaimRewardsStore;
  unDelegationsStore: UndelegationsStore;
  validatorsStore: ValidatorsStore;
  stakeEpochStore: StakeEpochStore;

  constructor(
    delegationsStore: DelegationsStore,
    claimRewardsStore: ClaimRewardsStore,
    unDelegationsStore: UndelegationsStore,
    validatorsStore: ValidatorsStore,
    stakeEpochStore: StakeEpochStore,
  ) {
    this.delegationStore = delegationsStore;
    this.claimRewardsStore = claimRewardsStore;
    this.unDelegationsStore = unDelegationsStore;
    this.validatorsStore = validatorsStore;
    this.stakeEpochStore = stakeEpochStore;
  }

  async updateStake(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    await Promise.all([
      this.delegationStore.loadDelegations(chain, network, forceRefetch),
      this.claimRewardsStore.loadClaimRewards(chain, network, forceRefetch),
      this.unDelegationsStore.loadUndelegations(chain, network, forceRefetch),
      this.validatorsStore.loadValidators(chain, network, forceRefetch),
      this.stakeEpochStore.refetchData(),
    ]);
  }
}

export class RootBalanceStore {
  nativeBalanceStore: BalanceStore;
  erc20BalanceStore: ERC20DenomBalanceStore;
  cw20BalanceStore: CW20DenomBalanceStore;
  activeChainStore: ActiveChainStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;
  aptosCoinDataStore: AptosCoinDataStore;
  solanaCoinDataStore: SolanaCoinDataStore;
  bitcoinBalanceStore: BitcoinDataStore;
  suiCoinDataStore: SuiCoinDataStore;
  compassSeiTokensAssociationsStore: CompassSeiTokensAssociationStore;
  addressStore: AddressStore;
  selectedNetworkStore: SelectedNetworkStore;
  forcedLoading: Record<string, boolean> = {};
  currencyStore: CurrencyStore;
  zeroStateTokensStore: ZeroStateTokensStore;

  constructor(
    balanceStore: BalanceStore,
    erc20BalanceStore: ERC20DenomBalanceStore,
    cw20BalanceStore: CW20DenomBalanceStore,
    activeChainStore: ActiveChainStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
    solanaCoinDataStore: SolanaCoinDataStore,
    aptosCoinDataStore: AptosCoinDataStore,
    bitcoinBalanceStore: BitcoinDataStore,
    suiCoinDataStore: SuiCoinDataStore,
    compassSeiTokensAssociationsStore: CompassSeiTokensAssociationStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    currencyStore: CurrencyStore,
    zeroStateTokensStore: ZeroStateTokensStore,
  ) {
    this.nativeBalanceStore = balanceStore;
    this.erc20BalanceStore = erc20BalanceStore;
    this.cw20BalanceStore = cw20BalanceStore;
    this.activeChainStore = activeChainStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
    this.solanaCoinDataStore = solanaCoinDataStore;
    this.suiCoinDataStore = suiCoinDataStore;
    this.aptosCoinDataStore = aptosCoinDataStore;
    this.bitcoinBalanceStore = bitcoinBalanceStore;
    this.compassSeiTokensAssociationsStore = compassSeiTokensAssociationsStore;
    this.addressStore = addressStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.currencyStore = currencyStore;
    this.zeroStateTokensStore = zeroStateTokensStore;

    makeObservable(this, {
      allTokens: computed,
      allSpendableTokens: computed,
      loading: computed,
      totalFiatValue: computed,
      forcedLoading: observable.deep,
    });
  }

  public getBalanceKey(
    chain: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    _address?: string,
  ): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address = _address ?? this.addressStore.addresses[chain as SupportedChain];
    const userPreferredCurrency = this.currencyStore.preferredCurrency;

    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  public getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${chain}-${chainId}`;
  }

  get allTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(
        this.nativeBalanceStore.balances.concat(
          this.erc20BalanceStore.erc20Tokens,
          this.cw20BalanceStore.cw20Tokens,
          (this.evmBalanceStore.evmBalance?.evmBalance ?? [])?.filter(
            (token) => !isNaN(Number(token.amount)) && new BigNumber(token.amount).gt(0),
          ),
          this.bitcoinBalanceStore.balances,
          this.aptosCoinDataStore.balances,
          this.solanaCoinDataStore.balances,
          this.suiCoinDataStore.balances,
        ),
      );
    }

    const nativeDenoms = this.chainInfosStore?.chainInfos?.[activeChain]?.nativeDenoms ?? [];
    const nativeTokens = this.nativeBalanceStore.balances.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = this.nativeBalanceStore.balances.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );
    const bitcoinTokens = this.bitcoinBalanceStore.balances;
    const aptosTokens = this.aptosCoinDataStore.balances;
    const solanaTokens = this.solanaCoinDataStore.balances;
    const suiTokens = this.suiCoinDataStore.balances;

    if (activeChain === 'seiTestnet2') {
      const erc20Tokens = this.erc20BalanceStore.erc20Tokens;
      const filterDuplicateSeiToken = (token: Token) => {
        let evmContract =
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom] ??
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom.toLowerCase()];
        if (!evmContract && token.ibcDenom) {
          evmContract =
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom] ??
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom.toLowerCase()];
        }
        if (!evmContract) {
          return true;
        }
        const matchFound = erc20Tokens.find(
          (erc20Token) => erc20Token.coinMinimalDenom.toLowerCase() === evmContract.toLowerCase(),
        );
        if (matchFound && !matchFound.coinGeckoId) {
          runInAction(() => {
            matchFound.coinGeckoId = token.coinGeckoId;
          });
        }
        return !matchFound;
      };
      const cw20Tokens = this.cw20BalanceStore.cw20Tokens.filter(filterDuplicateSeiToken);
      const nonNativeSeiBankTokens = nonNativeBankTokens.filter(filterDuplicateSeiToken);
      return nativeTokens.concat(sortTokenBalances(cw20Tokens.concat(erc20Tokens, nonNativeSeiBankTokens)));
    }

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(
          this.cw20BalanceStore.cw20Tokens,
          nonNativeBankTokens,
          bitcoinTokens,
          solanaTokens,
          suiTokens,
          aptosTokens,
        ),
      ),
    );
  }

  get allSpendableTokens() {
    const activeChain = this.activeChainStore?.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(
        this.nativeBalanceStore.spendableBalances.concat(
          this.erc20BalanceStore.erc20Tokens,
          this.cw20BalanceStore.cw20Tokens,
          (this.evmBalanceStore.evmBalance?.evmBalance ?? [])?.filter(
            (token) => !isNaN(Number(token.amount)) && new BigNumber(token.amount).gt(0),
          ),
          this.bitcoinBalanceStore.balances,
          this.aptosCoinDataStore.balances,
          this.solanaCoinDataStore.balances,
          this.suiCoinDataStore.balances,
        ),
      );
    }

    const nativeDenoms = this.chainInfosStore?.chainInfos?.[activeChain]?.nativeDenoms ?? [];
    const nativeTokens = this.nativeBalanceStore.spendableBalances.filter(
      (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
    );
    const nonNativeBankTokens = this.nativeBalanceStore.spendableBalances.filter(
      (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
    );
    const aptosTokens = this.aptosCoinDataStore.balances;
    const solanaTokens = this.solanaCoinDataStore.balances;
    const bitcoinTokens = this.bitcoinBalanceStore.balances;

    const suiTokens = this.suiCoinDataStore.balances;
    if (activeChain === 'seiTestnet2') {
      const erc20Tokens = this.erc20BalanceStore.erc20Tokens;
      const filterDuplicateSeiToken = (token: Token) => {
        let evmContract =
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom] ??
          this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom.toLowerCase()];
        if (!evmContract && token.ibcDenom) {
          evmContract =
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom] ??
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom.toLowerCase()];
        }
        if (!evmContract) {
          return true;
        }
        const matchFound = erc20Tokens.find(
          (erc20Token) => erc20Token.coinMinimalDenom.toLowerCase() === evmContract.toLowerCase(),
        );
        if (matchFound && !matchFound.coinGeckoId) {
          runInAction(() => {
            matchFound.coinGeckoId = token.coinGeckoId;
          });
        }
        return !matchFound;
      };
      const cw20Tokens = this.cw20BalanceStore.cw20Tokens.filter(filterDuplicateSeiToken);
      const nonNativeSeiBankTokens = nonNativeBankTokens.filter(filterDuplicateSeiToken);
      return nativeTokens.concat(
        sortTokenBalances(cw20Tokens.concat(erc20Tokens, nonNativeSeiBankTokens, solanaTokens, suiTokens)),
      );
    }

    return nativeTokens.concat(
      sortTokenBalances(
        this.erc20BalanceStore.erc20Tokens.concat(
          this.cw20BalanceStore.cw20Tokens,
          nonNativeBankTokens,
          aptosTokens,
          solanaTokens,
          suiTokens,
          bitcoinTokens,
        ),
      ),
    );
  }

  get allSpendableTokensAggregated() {
    return sortTokenBalances(
      this.nativeBalanceStore.aggregatedSpendableBalances.concat(
        this.erc20BalanceStore.allERC20Tokens,
        this.cw20BalanceStore.allCW20Tokens,
        this.bitcoinBalanceStore.balances,
        this.aptosCoinDataStore.balances,
        this.solanaCoinDataStore.balances,
        this.suiCoinDataStore.balances,
      ),
    );
  }

  get allAggregatedTokensLoading() {
    return (
      this.nativeBalanceStore.loading ||
      this.erc20BalanceStore.aggregatedLoadingStatus ||
      this.cw20BalanceStore.aggregatedLoadingStatus ||
      this.aptosCoinDataStore.loading
    );
  }

  getAggregatedBalancesForNetwork = computedFn(
    (balanceType: 'balances' | 'spendableBalances', network: SelectedNetworkType) => {
      const nativeDenoms = Object.values(this.chainInfosStore?.chainInfos ?? {}).reduce(
        (acc: Record<string, NativeDenom>, chainInfo) => Object.assign(acc, chainInfo.nativeDenoms),
        {},
      );
      const bankTokens =
        balanceType === 'spendableBalances'
          ? this.nativeBalanceStore.getAggregatedSpendableBalances(network)
          : this.nativeBalanceStore.getAggregatedBalances(network);
      const nativeTokens = bankTokens.filter(
        (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBankTokens = bankTokens.filter(
        (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );
      const erc20Tokens = this.erc20BalanceStore.getAggregatedERC20Tokens(network);
      const cw20Tokens = this.cw20BalanceStore.getAggregatedCW20Tokens(network);
      const evmTokens = this.evmBalanceStore.getAggregatedEvmTokens(network);
      const bitcoinTokens = this.bitcoinBalanceStore.getAggregatedBalances(network);
      const aptosTokens = this.aptosCoinDataStore.getAggregatedBalances(network);
      const solanaTokens = this.solanaCoinDataStore.getAggregatedBalances(network);
      const suiTokens = this.suiCoinDataStore.getAggregatedBalances(network);

      return nativeTokens.concat(
        sortTokenBalances(
          cw20Tokens.concat(
            erc20Tokens,
            nonNativeBankTokens,
            evmTokens,
            bitcoinTokens,
            aptosTokens,
            solanaTokens,
            suiTokens,
          ),
        ),
      );
    },
  );

  getTokensForChain = computedFn(
    (chain: SupportedChain, balanceType: 'balances' | 'spendableBalances', network: SelectedNetworkType) => {
      const nativeDenoms = this.chainInfosStore?.chainInfos?.[chain]?.nativeDenoms ?? [];
      const bankTokens =
        balanceType === 'spendableBalances'
          ? this.nativeBalanceStore.getSpendableBalancesForChain(chain, network)
          : this.nativeBalanceStore.getBalancesForChain(chain, network);
      const nativeTokens = bankTokens.filter(
        (token) => Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) && !token.ibcDenom,
      );
      const nonNativeBankTokens = bankTokens.filter(
        (token) => !Object.keys(nativeDenoms)?.includes(token.coinMinimalDenom) || !!token.ibcDenom,
      );
      const erc20Tokens = this.erc20BalanceStore.getERC20TokensForChain(chain, network);
      const cw20Tokens = this.cw20BalanceStore.getCW20TokensForChain(chain, network);
      const bitcoinTokens = this.bitcoinBalanceStore.balances;
      const aptosTokens = this.aptosCoinDataStore.getAptosBalances(chain, network);
      const solanaTokens = this.solanaCoinDataStore.getSolanaBalances(chain, network);
      const suiTokens = this.suiCoinDataStore.getSuiBalances(chain, network);

      if (chain === 'seiTestnet2') {
        const filterDuplicateSeiToken = (token: Token) => {
          let evmContract =
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom] ??
            this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.coinMinimalDenom.toLowerCase()];
          if (!evmContract && token.ibcDenom) {
            evmContract =
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom] ??
              this.compassSeiTokensAssociationsStore.compassSeiToEvmMapping[token.ibcDenom.toLowerCase()];
          }
          if (!evmContract) {
            return true;
          }
          const matchFound = erc20Tokens.find(
            (erc20Token) => erc20Token.coinMinimalDenom.toLowerCase() === evmContract.toLowerCase(),
          );
          if (matchFound && !matchFound.coinGeckoId) {
            runInAction(() => {
              matchFound.coinGeckoId = token.coinGeckoId;
            });
          }
          return !matchFound;
        };
        const seiCw20Tokens = cw20Tokens.filter(filterDuplicateSeiToken);
        const nonNativeSeiBankTokens = nonNativeBankTokens.filter(filterDuplicateSeiToken);
        return nativeTokens.concat(sortTokenBalances(seiCw20Tokens.concat(erc20Tokens, nonNativeSeiBankTokens)));
      }

      return nativeTokens.concat(
        sortTokenBalances(
          cw20Tokens.concat(erc20Tokens, nonNativeBankTokens, bitcoinTokens, aptosTokens, solanaTokens, suiTokens),
        ),
      );
    },
  );

  getBalancesForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    return this.getTokensForChain(chain, 'balances', network);
  });

  getSpendableBalancesForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    return this.getTokensForChain(chain, 'spendableBalances', network);
  });

  getAggregatedBalances = computedFn((network: SelectedNetworkType) => {
    return this.getAggregatedBalancesForNetwork('balances', network);
  });

  getAggregatedSpendableBalances = computedFn((network: SelectedNetworkType) => {
    return this.getAggregatedBalancesForNetwork('spendableBalances', network);
  });

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    return (
      this.nativeBalanceStore.getLoadingStatusForChain(chain, network) ||
      this.erc20BalanceStore.getLoadingStatusForChain(chain, network) ||
      this.cw20BalanceStore.getLoadingStatusForChain(chain, network)
    );
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    if (this.chainInfosStore.chainInfos[chain]?.evmOnlyChain) {
      return this.evmBalanceStore.getErrorStatusForChain(chain, network);
    }

    if (isAptosChain(chain)) {
      return this.aptosCoinDataStore.getErrorStatusForChain(chain, network);
    }

    if (isSolanaChain(chain)) {
      return this.solanaCoinDataStore.getErrorStatusForChain(chain, network);
    }

    if (isBitcoinChain(chain)) {
      return this.bitcoinBalanceStore.getErrorStatusForChain(chain, network);
    }

    return this.nativeBalanceStore.getErrorStatusForChain(chain, network);
  };

  get loading() {
    const activeChain = this.activeChainStore?.activeChain;
    const chainInfo = this.chainInfosStore.chainInfos[activeChain as SupportedChain];
    const _isAptosChain = isAptosChain(activeChain);
    const _isSolanaChain = isSolanaChain(activeChain);
    const _isSuiChain = isSuiChain(activeChain);
    const bitcoinChain = isBitcoinChain(activeChain as SupportedChain);

    if (_isAptosChain) {
      return this.aptosCoinDataStore.loading;
    }
    if (_isSolanaChain) {
      return this.solanaCoinDataStore.loading;
    }
    if (_isSuiChain) {
      return this.suiCoinDataStore.loading;
    }
    if (bitcoinChain) {
      return this.bitcoinBalanceStore.loading;
    }
    if (chainInfo?.evmOnlyChain) {
      return (
        this.evmBalanceStore.evmBalance.status === 'loading' ||
        this.erc20BalanceStore.loading ||
        (this.forcedLoading[this.getBalanceKey(activeChain)] ?? false)
      );
    }

    if (activeChain === 'aggregated' && this.nativeBalanceStore.aggregateBalanceVisible) {
      return false;
    }

    return (
      this.nativeBalanceStore.loadingStatus ||
      this.erc20BalanceStore.loading ||
      this.cw20BalanceStore.loading ||
      (this.forcedLoading[this.getBalanceKey(activeChain)] ?? false)
    );
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.allTokens;
    let hasAnyBalance = false;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
      if (asset.amount && !new BigNumber(asset.amount).isNaN() && new BigNumber(asset.amount).gt(0)) {
        hasAnyBalance = true;
      }
    }

    if (totalFiatValue.gt(0)) {
      return totalFiatValue;
    }

    if (hasAnyBalance) {
      return new BigNumber(NaN);
    }

    const zeroStateTokens = this.zeroStateTokensStore.zeroStateTokens;
    let hasAnyUsdPrice = false;
    for (const token of [...zeroStateTokens, ...balances]) {
      if (token.usdPrice) {
        hasAnyUsdPrice = true;
      }
    }

    return new BigNumber(hasAnyUsdPrice ? 0 : NaN);
  }

  async loadBalances(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    await Promise.allSettled([
      this.nativeBalanceStore.loadBalances(chain, network),
      this.erc20BalanceStore.loadBalances(chain, network),
      this.cw20BalanceStore.loadBalances(chain, network),
      this.evmBalanceStore.loadEvmBalance(chain, network),
      this.bitcoinBalanceStore.getData(chain, network),
      this.aptosCoinDataStore.getData(chain, network),
      this.solanaCoinDataStore.getData(chain as SupportedChain, network),
      this.suiCoinDataStore.getData(chain as SupportedChain, network),
    ]);
  }

  async refetchBalances(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, address?: string) {
    await Promise.allSettled([
      this.nativeBalanceStore.loadBalances(chain, network, address, true),
      this.erc20BalanceStore.loadBalances(chain, network, true),
      this.cw20BalanceStore.loadBalances(chain, network, true),
      this.evmBalanceStore.loadEvmBalance(chain, network, true),
      this.bitcoinBalanceStore.getData(chain, network, true),
      this.aptosCoinDataStore.getData(chain, network, true),
      this.solanaCoinDataStore.getData(chain as SupportedChain, network, true),
      this.suiCoinDataStore.getData(chain as SupportedChain, network, true),
    ]);
  }
}

export class RootStore {
  nmsStore: NmsStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  rootStakeStore: RootStakeStore;
  rootBalanceStore: RootBalanceStore;
  priceStore: PriceStore;
  percentageChangeDataStore: PercentageChangeDataStore;
  currencyStore: CurrencyStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;
  initializing: 'pending' | 'inprogress' | 'done' = 'pending';
  initPromise: Promise<[void, void]> | undefined = undefined;
  skipLoadingStake: boolean = false;

  constructor(
    nmsStore: NmsStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    rootBalanceStore: RootBalanceStore,
    rootStakeStore: RootStakeStore,
    priceStore: PriceStore,
    percentageChangeDataStore: PercentageChangeDataStore,
    currencyStore: CurrencyStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
    skipLoadingStake?: boolean,
  ) {
    this.nmsStore = nmsStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.rootStakeStore = rootStakeStore;
    this.rootBalanceStore = rootBalanceStore;
    this.priceStore = priceStore;
    this.percentageChangeDataStore = percentageChangeDataStore;
    this.currencyStore = currencyStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
    this.skipLoadingStake = skipLoadingStake ?? false;

    makeObservable(this, {
      initializing: observable,
    });
  }

  async initStores() {
    if (this.initializing !== 'pending') return;
    runInAction(() => {
      this.initializing = 'inprogress';
    });
    await Promise.allSettled([
      this.nmsStore.readyPromise,
      this.priceStore.readyPromise,
      this.addressStore.loadAddresses(),
      this.percentageChangeDataStore.readyPromise,
      // this.marketDataStore.readyPromise,
    ]);

    this.initPromise = Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
    await this.initPromise;
    runInAction(() => {
      this.initializing = 'done';
    });
  }

  async reloadAddresses(chain?: AggregatedSupportedChainType) {
    await this.addressStore.loadAddresses();
    if (this.initializing !== 'done') {
      this.initPromise && (await this.initPromise);
    }
    if (this.addressStore.addresses) {
      await Promise.all([
        this.rootBalanceStore.loadBalances(chain),
        this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
      ]);
    }
  }

  async setActiveChain(chain: AggregatedSupportedChainType) {
    if (this.activeChainStore.activeChain === chain) return;
    this.activeChainStore.setActiveChain(chain);

    if (this.initializing !== 'done') {
      const key = this.rootBalanceStore.getBalanceKey(chain);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = true;
      });
      this.initPromise && (await this.initPromise);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = false;
      });
    }
    await Promise.all([
      this.rootBalanceStore.loadBalances(chain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(chain, this.selectedNetworkStore.selectedNetwork),
    ]);
  }

  async setSelectedNetwork(network: SelectedNetworkType) {
    if (this.selectedNetworkStore.selectedNetwork === network) return;
    this.selectedNetworkStore.setSelectedNetwork(network);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(this.activeChainStore.activeChain, network),
    ]);
  }

  async setPreferredCurrency(currency: SupportedCurrencies) {
    this.currencyStore.updatePreferredCurrency(currency);
    if (this.initializing !== 'done') return;
    await this.priceStore.getData();
    await this.percentageChangeDataStore.getData();
    await Promise.all([
      this.rootBalanceStore.refetchBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(undefined, undefined, true),
    ]);
  }

  async setChains(chainInfos: Record<SupportedChain, ChainInfo>) {
    this.chainInfosStore.setChainInfos(chainInfos);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
  }
}

export class CompassRootStore {
  nmsStore: NmsStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  rootStakeStore: RootStakeStore;
  rootBalanceStore: RootBalanceStore;
  marketDataStore: MarketDataStore;
  currencyStore: CurrencyStore;
  chainInfosStore: ChainInfosStore;
  evmBalanceStore: EvmBalanceStore;
  initializing: 'pending' | 'inprogress' | 'done' = 'pending';
  initPromise: Promise<[void, void]> | undefined = undefined;
  skipLoadingStake: boolean = false;

  constructor(
    nmsStore: NmsStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    rootBalanceStore: RootBalanceStore,
    rootStakeStore: RootStakeStore,
    marketDataStore: MarketDataStore,
    currencyStore: CurrencyStore,
    chainInfosStore: ChainInfosStore,
    evmBalanceStore: EvmBalanceStore,
    skipLoadingStake?: boolean,
  ) {
    this.nmsStore = nmsStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.rootStakeStore = rootStakeStore;
    this.rootBalanceStore = rootBalanceStore;
    this.marketDataStore = marketDataStore;
    this.currencyStore = currencyStore;
    this.chainInfosStore = chainInfosStore;
    this.evmBalanceStore = evmBalanceStore;
    this.skipLoadingStake = skipLoadingStake ?? false;

    makeObservable(this, {
      initializing: observable,
    });
  }

  async initStores() {
    if (this.initializing !== 'pending') return;
    runInAction(() => {
      this.initializing = 'inprogress';
    });
    await Promise.allSettled([
      this.nmsStore.readyPromise,
      this.addressStore.loadAddresses(),
      this.marketDataStore.readyPromise,
    ]);

    this.initPromise = Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
    await this.initPromise;
    runInAction(() => {
      this.initializing = 'done';
    });
  }

  async reloadAddresses(chain?: AggregatedSupportedChainType) {
    await this.addressStore.loadAddresses();
    if (this.initializing !== 'done') {
      this.initPromise && (await this.initPromise);
    }
    if (this.addressStore.addresses) {
      await Promise.all([
        this.rootBalanceStore.loadBalances(chain),
        this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
      ]);
    }
  }

  async setActiveChain(chain: AggregatedSupportedChainType) {
    if (this.activeChainStore.activeChain === chain) return;
    this.activeChainStore.setActiveChain(chain);

    if (this.initializing !== 'done') {
      const key = this.rootBalanceStore.getBalanceKey(chain);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = true;
      });
      this.initPromise && (await this.initPromise);
      runInAction(() => {
        this.rootBalanceStore.forcedLoading[key] = false;
      });
    }
    await Promise.all([
      this.rootBalanceStore.loadBalances(chain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(chain, this.selectedNetworkStore.selectedNetwork),
    ]);
  }

  async setSelectedNetwork(network: SelectedNetworkType) {
    if (this.selectedNetworkStore.selectedNetwork === network) return;
    this.selectedNetworkStore.setSelectedNetwork(network);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork),
      this.skipLoadingStake
        ? Promise.resolve()
        : this.rootStakeStore.updateStake(this.activeChainStore.activeChain, network),
    ]);
  }

  async setPreferredCurrency(currency: SupportedCurrencies) {
    this.currencyStore.updatePreferredCurrency(currency);
    if (this.initializing !== 'done') return;
    await this.marketDataStore.getData();
    await Promise.all([
      this.rootBalanceStore.refetchBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(undefined, undefined, true),
    ]);
  }

  async setChains(chainInfos: Record<SupportedChain, ChainInfo>) {
    this.chainInfosStore.setChainInfos(chainInfos);
    if (this.initializing !== 'done') return;
    await Promise.all([
      this.rootBalanceStore.loadBalances(),
      this.skipLoadingStake ? Promise.resolve() : this.rootStakeStore.updateStake(),
    ]);
  }
}
