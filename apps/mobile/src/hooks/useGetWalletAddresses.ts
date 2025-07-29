export function useGetWalletAddresses(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain(); // Gets chain from global context
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const selectedNetwork = useSelectedNetwork(); // mainnet/testnet
  const { activeWallet } = useActiveWallet();   // selected wallet context
  const address = useAddress(activeChain);      // bech32 address
  const activeChainInfo = useChainInfo(activeChain); // full chain metadata

  const getIsMinitias = useGetIsMinitiaEvmChain(); // utility to check Minitia

  return useMemo(() => {
    // show EVM & Cosmos address if the chain supports both
    if (
      activeWallet &&
      activeWallet?.addresses?.[activeChain] &&
      (SHOW_ETH_ADDRESS_CHAINS.includes(activeChain) ||
        activeChainInfo?.evmOnlyChain ||
        getIsMinitias(selectedNetwork, activeChain))
    ) {
      if (activeChainInfo?.evmOnlyChain) {
        const evmAddress = pubKeyToEvmAddressToShow(activeWallet.pubKeys?.[activeChain]);
        return [evmAddress];
      }

      return [getEthereumAddress(address), address]; // [evm, bech32]
    }

    return [address]; // bech32 only
  }, [activeWallet, activeChain, activeChainInfo?.evmOnlyChain, address, selectedNetwork, getIsMinitias]);
}
