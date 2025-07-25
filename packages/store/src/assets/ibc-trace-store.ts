import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';

import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { RootDenomsStore } from './root-denom-store';

const ibcTraceUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denom-trace/base.json';

type IbcTraceData = Record<
  string,
  { path: string; baseDenom: string; originChainId: string; channelId: string; sourceChainId: string }
>;

let ibcTraceData: IbcTraceData = {};

export async function fetchIbcTraceData(): Promise<IbcTraceData> {
  const response = await axios.get(ibcTraceUrl);
  const data = response.data;
  ibcTraceData = data;

  return data;
}

export function getIbcTraceData() {
  return ibcTraceData;
}

export class IbcTraceFetcher {
  rootDenomsStore: RootDenomsStore;

  constructor(rootDenomsStore: RootDenomsStore) {
    makeAutoObservable(this);
    this.rootDenomsStore = rootDenomsStore;
  }

  async fetchIbcTrace(denom: string, restUrl: string, chainId: string): Promise<NativeDenom | undefined> {
    await this.rootDenomsStore.readyPromise;

    const denoms = this.rootDenomsStore.allDenoms;
    const ibcTraceData = getIbcTraceData();

    const baseDenom = getKeyToUseForDenoms(denom, chainId);

    const basicMatch = denoms[baseDenom];
    if (basicMatch) {
      return basicMatch;
    }

    const cacheMatch = ibcTraceData[baseDenom];
    if (cacheMatch) {
      return getDenom(cacheMatch);
    }

    try {
      const denomTrace = await getIbcTrace(denom, restUrl, chainId);
      return getDenom(denomTrace);
    } catch {
      return undefined;
    }

    function getDenom(trace: any) {
      if (trace.baseDenom) {
        const baseDenom = getKeyToUseForDenoms(
          trace.baseDenom,
          String(trace.sourceChainId || trace.originChainId || ''),
        );
        const _denom = denoms[baseDenom];
        return _denom;
      } else {
        return undefined;
      }
    }
  }
}

export async function getIbcTrace(ibcDenom: string, lcdUrl: string, chainId: string) {
  const res = await axios.post(`https://api.leapwallet.io/denom-trace`, {
    ibcDenom: ibcDenom,
    lcdUrl: lcdUrl,
    chainId: chainId,
  });

  return res.data.ibcDenomData;
}
