// eslint-disable-next-line simple-import-sort/imports
import { originalFetch } from './fetch-preserver';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BroadcastMode } from 'cosmjs-types/cosmos/tx/v1beta1/service';

import { decodeChainIdToChain, getExperimentalChains } from './utils';
const restUrlsApi = 'https://assets.leapwallet.io/cosmos-registry/v1/node-management-service/nms-REST.json';


export async function handleSendTx(data: any) {
  const tx = data?.tx;
  const mode = data?.mode;
  const _chainIdToChain = await decodeChainIdToChain();
  const chain = _chainIdToChain[data.chainId];
  const isProtoTx = !tx.msg;
  const formattedTx = isProtoTx ? new Uint8Array(Object.values(tx)) : tx;

  const params = isProtoTx
    ? {
        tx_bytes: Buffer.from(formattedTx).toString('base64'),
        mode: (() => {
          switch (mode) {
            case BroadcastMode.BROADCAST_MODE_ASYNC:
              return 'BROADCAST_MODE_ASYNC';
            case BroadcastMode.BROADCAST_MODE_BLOCK:
              return 'BROADCAST_MODE_BLOCK';
            case BroadcastMode.BROADCAST_MODE_SYNC:
              return 'BROADCAST_MODE_SYNC';
            default:
              return 'BROADCAST_MODE_UNSPECIFIED';
          }
        })(),
      }
    : {
        tx,
        mode: mode,
      };

  let baseURL;
  const experimentalChains = await getExperimentalChains();
  const experimentalChain = experimentalChains?.[chain as SupportedChain];
  if (experimentalChain) {
    baseURL = experimentalChains?.[chain].apis.rest;
  } else {
    try {
      const res = await originalFetch(restUrlsApi);
      const response = await res.json();
      baseURL = response[data.chainId]?.[0]?.nodeUrl;
    } catch (e) {
      //
    }
  }

  const url = isProtoTx ? `${baseURL}/cosmos/tx/v1beta1/txs` : `${baseURL}/txs`;
  const res = await originalFetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });

  const result = await res.json();

  const txResponse = isProtoTx ? result['tx_response'] : result;
  if (txResponse.code != null && txResponse.code !== 0) {
    throw new Error(txResponse['raw_log']);
  }
  return Buffer.from(txResponse.txhash, 'hex');
}
