/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { LIGHT_NODE_SYNC_WINDOW_SECS } from '../services/config/constants';

// Replace web globals with a module-level singleton
type LuminaSingleton = {
  luminaClient?: any;
};
const singleton: LuminaSingleton = {};

// ---- Minimal EventEmitter (no extra deps) ----
type Listener<T = any> = (payload: T) => void;

class TinyEmitter {
  private map = new Map<string, Set<Listener>>();

  on<T = any>(evt: string, fn: Listener<T>) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt)!.add(fn as Listener);
    return () => this.off(evt, fn);
  }

  off<T = any>(evt: string, fn: Listener<T>) {
    this.map.get(evt)?.delete(fn as Listener);
  }

  emit<T = any>(evt: string, payload: T) {
    this.map.get(evt)?.forEach((fn) => fn(payload));
  }
}

// ---- Port-like shim to mimic chrome.runtime.Port ----
// It provides postMessage + onMessage.addListener(...)
class PortShim {
  private emitter = new TinyEmitter();

  postMessage = (msg: unknown) => {
    // In a real integration, you might forward to a worker/native module.
    // For now, NodeClient can call back into onMessage when needed.
    this.emitter.emit('message', msg);
  };

  onMessage = {
    addListener: (fn: (msg: unknown) => void) => this.emitter.on('message', fn),
    removeListener: (fn: (msg: unknown) => void) => this.emitter.off('message', fn),
  };
}

// ---- Public API (same surface as your web version) ----
let initialisationStarted = false;

export async function init() {
  if (!singleton.luminaClient && !initialisationStarted) {
    initialisationStarted = true;

    // Lazy-load to keep the bundle smaller and avoid init before Hermes is ready
    const { NodeClient } = await import('lumina-node-wasm');

    // Create our in-memory Port shim instead of chrome.runtime.connect()
    const connection = new PortShim();

    // Optional: observe messages coming back through our shim
    connection.onMessage.addListener((message) => {
      console.log('lumina message received', message);
    });

    // Construct the client with our shimmed connection
    // @ts-ignore - external lib types
    singleton.luminaClient = new NodeClient(connection as any);

    initialisationStarted = false;
  }
}

export async function getIsLightNodeRunning(): Promise<boolean> {
  try {
    const isLightNodeRunning = await singleton.luminaClient?.isRunning();
    console.log('logging is light node running', isLightNodeRunning);
    return Boolean(isLightNodeRunning);
  } catch (e) {
    console.error('getIsLightNodeRunning error', e);
    return false;
  }
}

export async function startLightNode(network: 'mainnet' | 'arabica' | 'mocha' = 'mainnet') {
  console.log('starting light node (RN)…');

  const { NodeConfig, Network } = await import('lumina-node-wasm');

  const isLightNodeRunning = await getIsLightNodeRunning();
  if (isLightNodeRunning) {
    console.log('node is already running');
    return;
  }

  let networkConfig: any;
  switch (network) {
    case 'mainnet':
      networkConfig = NodeConfig.default(Network.Mainnet);
      break;
    case 'arabica':
      networkConfig = NodeConfig.default(Network.Arabica);
      break;
    case 'mocha':
      networkConfig = NodeConfig.default(Network.Mocha);
      break;
    default:
      console.error('unrecognised network ', network);
      return;
  }

  console.log('requesting connection to', networkConfig?.bootnodes, networkConfig);

  // Apply your runtime options
  networkConfig.customSamplingWindowSecs = LIGHT_NODE_SYNC_WINDOW_SECS;
  networkConfig.usePersistentMemory = true;

  // Start and wait until connected
  await singleton.luminaClient.start(networkConfig);
  await singleton.luminaClient.waitConnected();

  console.log('light node started');
}

export const getLightNodeEvents = async () => {
  try {
    return await singleton.luminaClient?.eventsChannel();
  } catch (e) {
    console.error('getLightNodeEvents error', e);
    return undefined;
  }
};

export async function stopLightNode() {
  try {
    if (await singleton.luminaClient?.isRunning()) {
      await singleton.luminaClient.stop();
      console.log('light node stopped');
    }
  } catch (e) {
    console.error('stopLightNode error', e);
  }
}

export async function updateStats() {
  try {
    if (await getIsLightNodeRunning()) {
      await singleton.luminaClient.waitConnected();

      const peerTrackerInfo = await singleton.luminaClient.peerTrackerInfo();
      console.log({ peerTrackerInfo });

      setTimeout(updateStats, 5000);
    } else {
      console.log('node is not running');
    }
  } catch (e) {
    console.error('updateStats error', e);
  }
}

export function getLastSyncedMessage(timestamp: Date) {
  const now = new Date();
  const syncedDate = new Date(timestamp);
  const diffInMs = now.getTime() - syncedDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 24) {
    if (diffInHours === 0) return '';
    if (diffInHours === 1) return '1hr ago';
    return `${diffInHours}hrs ago`;
  } else {
    if (diffInDays === 1) return 'yesterday';
    return `${diffInDays}d ago`;
  }
}
