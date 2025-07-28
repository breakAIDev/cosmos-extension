import { captureException } from '@sentry/react-native'; // RN version of Sentry
import { useQuery } from '@tanstack/react-query';
import { decode, encode } from 'bech32';
import { BigNumber } from 'bignumber.js';
import { useChainInfos } from '../../hooks/useChainInfos'; // This must be compatible with RN
import { useMemo } from 'react';
import { formatForSubstring } from '../../utils/strings';

import {
  getAptosBalance,
  getBitcoinBalance,
  getCelestiaBalance,
  getCosmosBalance,
  getEvmBalance,
  getMovementBalance,
  getSolanaBalance,
  getSuiBalance,
} from './balance';

type UseBalancesOpts = {
  cosmosAddress?: string;
  bitcoinAddress?: string;
  moveAddress?: string;
  evmAddress?: string;
  aptosAddress?: string;
  solanaAddress?: string;
  suiAddress?: string;
};

const convertBech32Address = (address: string, prefix: string) => {
  const { words } = decode(address);
  return encode(prefix, words);
};

export const useBalances = ({
  cosmosAddress,
  bitcoinAddress,
  moveAddress,
  evmAddress,
  solanaAddress,
  suiAddress,
}: UseBalancesOpts) => {
  const chainInfos = useChainInfos();

  // Cosmos
  const cosmosQuery = useQuery({
    queryKey: ['cosmos-balance', cosmosAddress],
    queryFn: async () => {
      if (!cosmosAddress) return new BigNumber(0);
      return getCosmosBalance(cosmosAddress);
    },
    enabled: !!cosmosAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Celestia
  const celestiaAddress = useMemo(() => {
    if (!cosmosAddress) return undefined;
    return convertBech32Address(cosmosAddress, chainInfos.celestia.addressPrefix);
  }, [cosmosAddress, chainInfos.celestia.addressPrefix]);

  const celestiaQuery = useQuery({
    queryKey: ['celestia-balance', celestiaAddress],
    queryFn: async () => {
      if (!celestiaAddress) return new BigNumber(0);
      return getCelestiaBalance(celestiaAddress);
    },
    enabled: !!celestiaAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Bitcoin
  const bitcoinQuery = useQuery({
    queryKey: ['bitcoin-balance', bitcoinAddress],
    queryFn: async () => {
      if (!bitcoinAddress) return new BigNumber(0);
      return getBitcoinBalance(bitcoinAddress);
    },
    enabled: !!bitcoinAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Movement (Aptos move chain)
  const movementQuery = useQuery({
    queryKey: ['movement-balance', moveAddress],
    queryFn: async () => {
      if (!moveAddress) return new BigNumber(0);
      return getMovementBalance(moveAddress);
    },
    enabled: !!moveAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // EVM (Ethereum)
  const evmQuery = useQuery({
    queryKey: ['evm-balance', evmAddress],
    queryFn: async () => {
      if (!evmAddress) return new BigNumber(0);
      return getEvmBalance(evmAddress);
    },
    enabled: !!evmAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Aptos
  const aptosQuery = useQuery({
    queryKey: ['aptos-balance', moveAddress],
    queryFn: async () => {
      if (!moveAddress) return new BigNumber(0);
      return getAptosBalance(moveAddress);
    },
    enabled: !!moveAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Solana
  const solanaQuery = useQuery({
    queryKey: ['solana-balance', solanaAddress],
    queryFn: async () => {
      if (!solanaAddress) return new BigNumber(0);
      return getSolanaBalance(solanaAddress);
    },
    enabled: !!solanaAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Sui
  const suiQuery = useQuery({
    queryKey: ['sui-balance', suiAddress],
    queryFn: async () => {
      if (!suiAddress) return new BigNumber(0);
      return getSuiBalance(suiAddress);
    },
    enabled: !!suiAddress,
    retry: false,
    onError: (error) => {
      captureException(error);
    },
  });

  // Loading state
  const isLoading =
    (cosmosAddress && cosmosQuery.isLoading) ||
    (bitcoinAddress && bitcoinQuery.isLoading) ||
    (moveAddress && movementQuery.isLoading) ||
    (evmAddress && evmQuery.isLoading) ||
    (celestiaAddress && celestiaQuery.isLoading) ||
    (moveAddress && aptosQuery.isLoading) ||
    (solanaAddress && solanaQuery.isLoading) ||
    (suiAddress && suiQuery.isLoading);

  // Balances structure
  const data = useMemo(() => {
    const balances = [
      {
        key: chainInfos.cosmos.key,
        name: 'Cosmos Hub',
        denom: chainInfos.cosmos.denom,
        address: cosmosAddress,
        amount: cosmosQuery.data,
      },
      {
        key: chainInfos.ethereum.key,
        name: 'Ethereum',
        denom: chainInfos.ethereum.denom,
        address: evmAddress,
        amount: evmQuery.data,
      },
      {
        key: chainInfos.celestia.key,
        name: 'Celestia',
        denom: chainInfos.celestia.denom,
        address: celestiaAddress,
        amount: celestiaQuery.data,
      },
      {
        key: chainInfos.bitcoin.key,
        name: 'Bitcoin',
        denom: chainInfos.bitcoin.denom,
        address: bitcoinAddress,
        amount: bitcoinQuery.data,
      },
      {
        key: chainInfos.solana.key,
        name: 'Solana',
        denom: chainInfos.solana.denom,
        address: solanaAddress,
        amount: solanaQuery.data,
      },
      {
        key: chainInfos.sui.key,
        name: 'Sui',
        denom: chainInfos.sui.denom,
        address: suiAddress,
        amount: suiQuery.data,
      },
      {
        key: chainInfos.aptos.key,
        name: 'Aptos',
        denom: chainInfos.aptos.denom,
        address: moveAddress,
        amount: aptosQuery.data,
      },
      {
        key: chainInfos.movement.key,
        name: 'Movement',
        denom: chainInfos.movement.denom,
        address: moveAddress,
        amount: movementQuery.data,
      },
    ].filter((balance) => balance.address);

    return balances.map((balance) => ({
      ...balance,
      amount: formatForSubstring(balance.amount?.toString() ?? '0.00'),
    }));
  }, [
    cosmosAddress,
    bitcoinAddress,
    evmAddress,
    moveAddress,
    celestiaAddress,
    solanaAddress,
    suiAddress,
    cosmosQuery.data,
    bitcoinQuery.data,
    evmQuery.data,
    movementQuery.data,
    celestiaQuery.data,
    aptosQuery.data,
    solanaQuery.data,
    suiQuery.data,
    chainInfos,
  ]);

  // All zero check
  const zeroBalance = useMemo(() => {
    return data.every((balance) => balance.amount === '0');
  }, [data]);

  // Filter non-zero balances
  const nonZeroData = useMemo(() => {
    return data.filter((balance) => balance.amount !== '0');
  }, [data]);

  return { data, zeroBalance, nonZeroData, isLoading };
};
