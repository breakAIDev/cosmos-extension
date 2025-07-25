import {
  AccountAddress,
  AccountAuthenticatorEd25519,
  AnyRawTransaction,
  Aptos,
  AptosConfig,
  Deserializer,
  Ed25519PublicKey,
  Ed25519Signature,
  EntryFunctionArgumentTypes,
  Network,
  Serializer,
  SigningScheme,
  SimpleEntryFunctionArgumentTypes,
} from '@aptos-labs/ts-sdk';
import {
  AccountInfo,
  APTOS_CHAINS,
  AptosChangeNetworkInput,
  AptosChangeNetworkMethod,
  AptosChangeNetworkOutput,
  AptosConnectMethod,
  AptosConnectOutput,
  AptosDisconnectMethod,
  AptosFeatures,
  AptosGetAccountMethod,
  AptosGetNetworkMethod,
  AptosOnAccountChangeInput,
  AptosOnAccountChangeMethod,
  AptosOnNetworkChangeInput,
  AptosOnNetworkChangeMethod,
  AptosSignAndSubmitTransactionInput,
  AptosSignAndSubmitTransactionMethod,
  AptosSignAndSubmitTransactionOutput,
  AptosSignMessageInput,
  AptosSignMessageMethod,
  AptosSignMessageOutput,
  AptosSignTransactionMethod,
  AptosSignTransactionOutput,
  AptosWallet,
  AptosWalletAccount,
  IdentifierArray,
  NetworkInfo,
  UserResponse,
  UserResponseStatus,
} from '@aptos-labs/wallet-standard';
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants/chain-infos';
import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/is-aptos-chain';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { base64 } from '@scure/base';
import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE, RequestSignAptosMsg } from './types';
import { APTOS_METHOD_TYPE } from './types/aptos';

const IDENTIFIER = process.env.APP?.includes('compass') ? 'compass' : 'leap';
export const APTOS_CHAIN_IDS = ['aptos-1', 'aptos-2', 'aptos-126', 'aptos-177', 'aptos-250'];

/**
 * This class is a template you can modify to implement an AIP-62 Wallet.
 *
 * Sections of the code which need to be revised will be marked with a "REVISION" comment.
 * We recommend using the REVISION comments like a checklist and deleting them as you go.
 * Ex. REVISION - Update this section.
 *
 * Function implementations are for DEMONSTRATION PURPOSES ONLY. Please ensure you rewrite all features
 * to use your Wallet as the method of communicating on-chain.
 *
 * For a working implementation of this example, see the next-js example app here: https://github.com/aptos-labs/aptos-wallet-adapter/tree/main/apps/nextjs-example
 * (And more specifically, see https://github.com/aptos-labs/aptos-wallet-adapter/blob/main/apps/nextjs-example/src/utils/standardWallet.ts)
 */

/**
 * Interface of a **WalletAccount**, also referred to as an **Account**.
 *
 * An account is a _read-only data object_ that is provided from the Wallet to the app, authorizing the app to use it.
 *
 * The app can use an account to display and query information from a chain.
 *
 * The app can also act using an account by passing it to functions of the Wallet.
 *
 * Wallets may use or extend {@link "@wallet-standard/wallet".ReadonlyWalletAccount} which implements this interface.
 *
 */
export class LeapWalletAccount implements AptosWalletAccount {
  /** Address of the account, corresponding with a public key. */
  address: string;

  /** Public key of the account, corresponding with a secret key to use. */
  publicKey: Uint8Array;

  /**
   * Chains supported by the account.
   *
   * This must be a subset of ["aptos:devnet", "aptos:testnet", "aptos:localnet", "aptos:mainnet"].
   *
   * It is recommended to support at least ["aptos:devnet", "aptos:testnet", and "aptos:mainnet"].
   */
  chains: IdentifierArray = APTOS_CHAINS.filter((chain) => !chain.includes('devnet'));

  /**
   * Function names of features that are supported for this Wallet's account object.
   */
  features: IdentifierArray = [];

  /** The signing scheme used for the private key of the address. Ex. SigningScheme.Ed25519 */
  signingScheme: SigningScheme;

  /** Optional user-friendly descriptive label or name for the account. This may be displayed by the app. */
  label?: string;

  /**
   * Optional user-friendly icon for the account. This may be displayed by the app.
   */
  icon?:
    | `data:image/svg+xml;base64,${string}`
    | `data:image/webp;base64,${string}`
    | `data:image/png;base64,${string}`
    | `data:image/gif;base64,${string}`
    | undefined;

  accountInfo: AccountInfo;

  constructor(account: { address: string; publicKey: string; signingScheme: SigningScheme }) {
    this.address = account.address;
    this.publicKey = base64.decode(account.publicKey);
    // TODO: remove this and replace with line below
    this.chains = [];
    // this.chains = APTOS_CHAINS.filter((chain) => !chain.includes('devnet'));

    /**
     * REVISION - Ensure this signing scheme matches the encoding used to generate your private key.
     */
    this.signingScheme = account.signingScheme;
    this.accountInfo = new AccountInfo({
      address: this.address,
      publicKey: new Ed25519PublicKey(this.publicKey),
    });
  }
}

/**
 * 2. Update the values of this class to match your Wallet's deatils.
 * 3. Implement each of the features below. (Including adding implementations for any additional required features that you can find here in the "AptosFeatures" type: https://github.com/aptos-labs/wallet-standard/blob/main/src/features/index.ts)
 */
export class LeapAptos implements AptosWallet {
  readonly url: string = 'https://leapwallet.io';
  readonly version = '1.0.0';
  readonly name: string = 'Leap Wallet';
  readonly icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY2IiBoZWlnaHQ9IjE2NiIgdmlld0JveD0iMCAwIDE2NiAxNjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83ODBfNjEwKSI+CjxyZWN0IHdpZHRoPSIxNjYiIGhlaWdodD0iMTY2IiBmaWxsPSIjQzVGRkNFIi8+CjxwYXRoIGQ9Ik0xMzguNjE0IDEwMC40NDVDMTM4LjYxNCAxMjAuMjE3IDExNC40ODMgMTI4LjI1MiA4NC41MjE2IDEyOC4yNTJDNTQuNTYwMyAxMjguMjUyIDMwLjA3ODQgMTIwLjIxNyAzMC4wNzg0IDEwMC40NDVDMzAuMDc4NCA4MC42NzI0IDU0LjM4NDYgNjQuNjczIDg0LjM0NiA2NC42NzNDMTE0LjMwNyA2NC42NzMgMTM4LjYxNCA4MC43MDc0IDEzOC42MTQgMTAwLjQ0NVoiIGZpbGw9IiMyNEE5NUEiLz4KPHBhdGggZD0iTTEzMy4xMDMgNTcuMzQ3MkMxMzMuMTAzIDQ2LjkzNyAxMjQuNjAzIDM4LjQ4MzIgMTE0LjEzNiAzOC40ODMyQzEwOC42OTMgMzguNDgzMiAxMDMuNzg3IDQwLjc3MTkgMTAwLjMzIDQ0LjQxNzFDOTkuNzk0NCA0NC45ODE4IDk5LjAxMTggNDUuMjU2OSA5OC4yNDkgNDUuMTAyOUM5My44NjkgNDQuMjE4NSA4OS4yMzU1IDQzLjcyMzIgODQuNDU1NSA0My43MjMyQzc5LjY3NiA0My43MjMyIDc1LjA0MyA0NC4xODkzIDcwLjY2MzQgNDUuMDk1QzY5Ljg5OTggNDUuMjUyOSA2OS4xMTM4IDQ0Ljk4MjMgNjguNTc1IDQ0LjQxODZDNjUuMDkgNDAuNzcyNSA2MC4xODY3IDM4LjQ4MzIgNTQuNzc1MiAzOC40ODMyQzQ0LjMwOCAzOC40ODMyIDM1LjgwNzkgNDYuOTM3IDM1LjgwNzkgNTcuMzQ3MkMzNS44MDc5IDYwLjM4MzQgMzYuNTI2MiA2My4yMjczIDM3Ljc5MTMgNjUuNzU3QzM4LjA5NDMgNjYuMzYyOCAzOC4xMjQ4IDY3LjA3MjEgMzcuODYyNyA2Ny42OTY2QzM2LjYzNTMgNzAuNjIxMiAzNS45ODM1IDczLjcwOTEgMzUuOTgzNSA3Ni45MDk4QzM1Ljk4MzUgOTUuMjQ5OCA1Ny42OTA1IDExMC4wOTYgODQuNDU1NSAxMTAuMDk2QzExMS4yMjEgMTEwLjA5NiAxMzIuOTI4IDk1LjI0OTggMTMyLjkyOCA3Ni45MDk4QzEzMi45MjggNzMuNzA5MSAxMzIuMjc2IDcwLjYyMTIgMTMxLjA0OCA2Ny42OTY2QzEzMC43ODYgNjcuMDcyMSAxMzAuODE3IDY2LjM2MjggMTMxLjEyIDY1Ljc1N0MxMzIuMzg1IDYzLjIyNzMgMTMzLjEwMyA2MC4zODM0IDEzMy4xMDMgNTcuMzQ3MloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjIyNzEgNjcuODExOUM1OS42Mjg3IDY3LjgxMTkgNjQuODE4MyA2Mi42NTA2IDY0LjgxODMgNTYuMjgzOUM2NC44MTgzIDQ5LjkxNzEgNTkuNjI4NyA0NC43NTU5IDUzLjIyNzEgNDQuNzU1OUM0Ni44MjU1IDQ0Ljc1NTkgNDEuNjM2IDQ5LjkxNzEgNDEuNjM2IDU2LjI4MzlDNDEuNjM2IDYyLjY1MDYgNDYuODI1NSA2Ny44MTE5IDUzLjIyNzEgNjcuODExOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMTUuMDY1IDY3LjgxMTlDMTIxLjQ2NiA2Ny44MTE5IDEyNi42NTYgNjIuNjUwNiAxMjYuNjU2IDU2LjI4MzlDMTI2LjY1NiA0OS45MTcxIDEyMS40NjYgNDQuNzU1OSAxMTUuMDY1IDQ0Ljc1NTlDMTA4LjY2MyA0NC43NTU5IDEwMy40NzQgNDkuOTE3MSAxMDMuNDc0IDU2LjI4MzlDMTAzLjQ3NCA2Mi42NTA2IDEwOC42NjMgNjcuODExOSAxMTUuMDY1IDY3LjgxMTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDcuMDc1OSAxMjYuODI5QzQ5LjU2OTggMTI2LjgyOSA1MS41MzY4IDEyNC42NjMgNTEuMjU1OCAxMjIuMjE4QzUwLjIzNzIgMTEzLjU1NCA0NS45MTY4IDk0Ljc5NSAyNi45MTQ0IDgzLjUxMTVDNi4wODM2OCA3MS4xMzg3IDE1Ljk5NDEgMTA0LjAzNCAyMC4xMzY1IDExNi4wMTlDMjAuOTc0NCAxMTguNDQzIDIwLjAwMjcgMTIxLjEzNSAxNy43NzgzIDEyMi40MTFMMTYuNDEyMSAxMjMuMTk2QzE0LjY1NTkgMTI0LjIwOSAxNS4zOTM1IDEyNi44MjkgMTcuMzk1NiAxMjYuODI5SDQ3LjA3NTlaIiBmaWxsPSIjMzJEQTZEIi8+CjxwYXRoIGQ9Ik0xMjIuNTY2IDEyNi44MjlDMTIwLjMxOCAxMjYuODI5IDExOC41NjIgMTI0LjY2MyAxMTguODA4IDEyMi4yMThDMTE5LjY4NiAxMTMuNTg5IDEyMy42MiA5NC43OTUgMTQwLjc2MSA4My41MTE1QzE1OS43NDEgNzEuMDQyNiAxNTAuNTAzIDEwNC41NDcgMTQ2LjgxNSAxMTYuMjk0QzE0Ni4wOTIgMTE4LjU5OCAxNDYuOTgyIDEyMS4xMDYgMTQ5LjAyMiAxMjIuMzk5TDE1MC4yOCAxMjMuMTk2QzE1MS44NiAxMjQuMjA5IDE1MS4xOTMgMTI2LjgyOSAxNDkuNDAyIDEyNi44MjlIMTIyLjU2NloiIGZpbGw9IiMzMkRBNkQiLz4KPHBhdGggZD0iTTUzLjI0MjggNjMuMTc4N0M1Ny4wNjE3IDYzLjE3ODcgNjAuMTU3NiA2MC4wODI4IDYwLjE1NzYgNTYuMjYzOUM2MC4xNTc2IDUyLjQ0NSA1Ny4wNjE3IDQ5LjM0OTEgNTMuMjQyOCA0OS4zNDkxQzQ5LjQyMzkgNDkuMzQ5MSA0Ni4zMjggNTIuNDQ1IDQ2LjMyOCA1Ni4yNjM5QzQ2LjMyOCA2MC4wODI4IDQ5LjQyMzkgNjMuMTc4NyA1My4yNDI4IDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik0xMTUuMDgxIDYzLjE3ODdDMTE4LjkgNjMuMTc4NyAxMjEuOTk1IDYwLjA4MjggMTIxLjk5NSA1Ni4yNjM5QzEyMS45OTUgNTIuNDQ1IDExOC45IDQ5LjM0OTEgMTE1LjA4MSA0OS4zNDkxQzExMS4yNjIgNDkuMzQ5MSAxMDguMTY2IDUyLjQ0NSAxMDguMTY2IDU2LjI2MzlDMTA4LjE2NiA2MC4wODI4IDExMS4yNjIgNjMuMTc4NyAxMTUuMDgxIDYzLjE3ODdaIiBmaWxsPSIjMDkyNTExIi8+CjxwYXRoIGQ9Ik05OS43OTk1IDgzLjAxNzZDMTAxLjUxNCA4My4xNjUxIDEwMi44MSA4NC42ODYyIDEwMi4zNzggODYuMzUxOEMxMDIuMDI5IDg3LjY5NzkgMTAxLjUyOSA4OS4wMDM5IDEwMC44ODYgOTAuMjQ0MkM5OS43NjMgOTIuNDA5IDk4LjIyNDYgOTQuMzMxNSA5Ni4zNTg2IDk1LjkwMThDOTQuNDkyNyA5Ny40NzIyIDkyLjMzNTcgOTguNjU5NiA5MC4wMTA4IDk5LjM5NjNDODcuNjg2IDEwMC4xMzMgODUuMjM4OCAxMDAuNDA1IDgyLjgwOSAxMDAuMTk2QzgwLjM3OTEgOTkuOTg2NiA3OC4wMTQzIDk5LjMwMSA3NS44NDk0IDk4LjE3OEM3My42ODQ2IDk3LjA1NTEgNzEuNzYyMSA5NS41MTY3IDcwLjE5MTcgOTMuNjUwN0M2OC42MjE0IDkxLjc4NDggNjcuNDM0IDg5LjYyNzggNjYuNjk3MiA4Ny4zMDI5QzY2LjE3MDEgODUuNjM5NiA2NS44ODExIDgzLjkxMzUgNjUuODM1OSA4Mi4xNzYxQzY1LjgwNiA4MS4wMjk0IDY2LjgyNDQgODAuMTgwOCA2Ny45NjczIDgwLjI3OTFMODQuNDAwNyA4MS42OTI4TDk5Ljc5OTUgODMuMDE3NloiIGZpbGw9IiMwOTI1MTEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF83ODBfNjEwIj4KPHJlY3Qgd2lkdGg9IjE2NiIgaGVpZ2h0PSIxNjYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';
  // TODO: remove this and replace with line below
  chains = [];
  //chains = APTOS_CHAINS.filter((chain) => !chain.includes('devnet'));
  chainIds: string[] = APTOS_CHAIN_IDS;
  activeNetwork: NetworkInfo & { chainKey: string } = {
    name: Network.MAINNET,
    chainId: Number(ChainInfos.movement.chainId?.replace('aptos-', '') ?? ''),
    url: ChainInfos.movement.apis.rpc,
    chainKey: ChainInfos.movement.key,
  };

  accounts: LeapWalletAccount[] = [];

  private inpageStream: WindowPostMessageStream;
  private origin: string;

  /**
   * The template code's constructor currently initializes `signer` to act as the private key for an account on-chain, and uses
   * `aptos` to handle the on-chain connection.
   *
   */
  constructor() {
    this.inpageStream = new WindowPostMessageStream({
      name: `${IDENTIFIER}:inpage`,
      target: `${IDENTIFIER}:content`,
    });
    this.inpageStream.setMaxListeners(200);
    this.origin = window.location.origin;
  }

  private static generateId() {
    return uuidv4();
  }

  private send(method: APTOS_METHOD_TYPE, data?: any): string {
    const id = LeapAptos.generateId();

    this.inpageStream.write({
      ...(data ?? {}),
      id,
      method,
      origin: this.origin,
      ecosystem: LINE_TYPE.APTOS,
    });

    return id;
  }

  private request(method: APTOS_METHOD_TYPE, data?: any): Promise<any> {
    const id = this.send(method, data);
    return new Promise((resolve) => {
      this.inpageStream.on('data', (result) => {
        if (result.id === id) {
          if (result?.name === 'invokeOpenSidePanel') {
            this.send(APTOS_METHOD_TYPE.OPEN_SIDE_PANEL, data);
            return;
          }
          resolve(result);
        }
      });
    });
  }

  private async requestWrapper(method: APTOS_METHOD_TYPE, data?: any): Promise<any> {
    const response = await this.request(method, data);
    if (response?.payload?.error) {
      throw new Error(response?.payload?.error);
    }

    return response?.payload;
  }

  /**
   * REVISION - List all features your wallet supports below.
   * You will need to implement how your wallet supports each.
   *
   * In order to be compatible with the AIP-62 Wallet standard, ensure you are at least supporting all
   * currently required features by checking the list of features in the `AptosFeatures` type here:
   * https://github.com/aptos-labs/wallet-standard/blob/main/src/features/index.ts
   *
   * To find the names of features to pass into `this.features` below you can either go into the feature implementations
   * and look at the <AptosFeature>NameSpace variable, or you can import the `AptosFeatures` type and see the names there.
   * Ex. See `AptosSignTransactionNamespace` in https://github.com/aptos-labs/wallet-standard/blob/main/src/features/aptosSignTransaction.ts
   *
   * For additional customization, you may implement optional features.
   * For the most support though, you should extend the wallet-standard to support additional features as part of the standard.
   */
  get features(): AptosFeatures {
    return {
      'aptos:connect': {
        version: '1.0.0',
        connect: this.connect,
      },
      'aptos:network': {
        version: '1.0.0',
        network: this.network,
      },
      'aptos:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect,
      },
      'aptos:signTransaction': {
        version: '1.0.0',
        signTransaction: this.signTransaction,
      },
      'aptos:signMessage': {
        version: '1.0.0',
        signMessage: this.signMessage,
      },
      'aptos:onAccountChange': {
        version: '1.0.0',
        onAccountChange: this.onAccountChange,
      },
      'aptos:onNetworkChange': {
        version: '1.0.0',
        onNetworkChange: this.onNetworkChange,
      },
      'aptos:account': {
        version: '1.0.0',
        account: this.account,
      },
      'aptos:signAndSubmitTransaction': {
        version: '1.1.0',
        signAndSubmitTransaction: this.signAndSubmitTransaction,
      },
      'aptos:changeNetwork': {
        version: '1.0.0',
        changeNetwork: this.changeNetwork,
      },
    };
  }

  /**
   * Look up the account info for the currently connected wallet address on the chosen network.
   *
   * @returns Return account info.
   */
  account: AptosGetAccountMethod = async (): Promise<AccountInfo> => {
    try {
      if (this.accounts.length === 0) {
        await this.connect();
      }
      return this.accounts[0].accountInfo;
    } catch (e) {
      console.error(e);
      return {} as unknown as AccountInfo;
    }
  };

  /**
   *
   * @returns Whether the user approved connecting their account, and account info.
   * @throws Error when unable to connect to the Wallet provider.
   */
  connect: AptosConnectMethod = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _networkInfo?: NetworkInfo,
  ): Promise<UserResponse<AptosConnectOutput>> => {
    try {
      const response = await this.requestWrapper(APTOS_METHOD_TYPE.GET_KEYS);
      const key = response?.keys[0];
      this.accounts = [
        new LeapWalletAccount({
          address: key.address,
          publicKey: key.publicKey ?? '',
          signingScheme: SigningScheme.Ed25519,
        }),
      ];
      const accountInfo = this.accounts[0].accountInfo;
      return {
        status: UserResponseStatus.APPROVED,
        args: accountInfo,
      };
    } catch (e) {
      console.error(e);
      return {
        status: UserResponseStatus.REJECTED,
      };
    }
  };

  /**
   * Return the name, chainId, and url of the network connection your wallet is using to connect to the Aptos chain.
   *
   * @returns Which network the connected Wallet is pointing to.
   */
  network: AptosGetNetworkMethod = async (): Promise<NetworkInfo> => {
    try {
      const networkInfo = await this.requestWrapper(APTOS_METHOD_TYPE.GET_NETWORK);
      if (!networkInfo) {
        throw new Error('Failed to get active network info');
      }

      if (!networkInfo.chainId || !isAptosChain(networkInfo.chainId)) {
        return this.activeNetwork;
      }

      const chainId = Number(networkInfo.chainId?.replace('aptos-', ''));
      const networkName = networkInfo.selectedNetwork;
      this.activeNetwork = {
        name: networkName,
        chainId: chainId,
        url: networkInfo.restUrl,
        chainKey: networkInfo.chainKey,
      };

      return this.activeNetwork;
    } catch (e) {
      console.error(e);
      return this.activeNetwork;
    }
  };

  /**
   * Remove the permission of the Wallet class to access the account that was connected.
   *
   * @returns Resolves when done cleaning up.
   */
  disconnect: AptosDisconnectMethod = async (): Promise<void> => {
    await this.requestWrapper(APTOS_METHOD_TYPE.DISCONNECT);

    return;
  };

  /**
   * @param transaction - A transaction that the user should have the ability to sign if they choose to.
   * @param asFeePayer - Optionally, another this signature is acting as a fee-payer for the transaction being signed.
   * @returns The result of whether the user chose to sign the transaction or not.
   */
  signTransaction: AptosSignTransactionMethod = async (
    transaction: AnyRawTransaction,
    asFeePayer?: boolean,
  ): Promise<UserResponse<AptosSignTransactionOutput>> => {
    if (transaction.secondarySignerAddresses) {
      throw new Error('Multi-agent transactions are not supported yet');
    }
    const chainId = `aptos-${transaction.rawTransaction.chain_id.chainId}`;
    const serializer = new Serializer();
    serializer.serialize(transaction);
    const txBytes = Buffer.from(serializer.toUint8Array()).toString('hex');
    const msg = new RequestSignAptosMsg(chainId, this.accounts[0].address, txBytes, false, false, {
      asFeePayer,
      preferNoSetFee: false,
    });
    msg.validateBasic();
    const signResponse = await this.requestWrapper(APTOS_METHOD_TYPE.SIGN_TRANSACTION, msg);
    const deserializer3 = new Deserializer(Uint8Array.from(Buffer.from(signResponse, 'hex')));
    const accountAuthenticator = AccountAuthenticatorEd25519.deserialize(deserializer3);
    return {
      status: UserResponseStatus.APPROVED,
      args: accountAuthenticator,
    };
    // if (asFeePayer) {
    //   const senderAuthenticator = this.aptos.transaction.signAsFeePayer({
    //     signer: this.signer,
    //     transaction,
    //   });

    //   return Promise.resolve({
    //     status: UserResponseStatus.APPROVED,
    //     args: senderAuthenticator,
    //   });
    // }
    // const senderAuthenticator = this.aptos.transaction.sign({
    //   signer: this.signer,
    //   transaction,
    // });
  };

  static formatFunctionArgument(
    functionArg: EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes,
  ): EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes {
    if (functionArg) {
      if (Array.isArray(functionArg)) return functionArg.map(LeapAptos.formatFunctionArgument);
      if ('string' === typeof functionArg || 'number' === typeof functionArg || 'boolean' === typeof functionArg) {
        return functionArg;
      }
      if ('bigint' === typeof functionArg) {
        return functionArg.toString();
      }
      if (functionArg instanceof Uint8Array) {
        return functionArg;
      }
      if (functionArg instanceof ArrayBuffer) {
        return new Uint8Array(functionArg);
      }
      if ('values' in functionArg) {
        return functionArg.values.map(LeapAptos.formatFunctionArgument);
      }
      if ('data' in functionArg) {
        return functionArg.toString();
      }
      if (functionArg.value) {
        return functionArg.value instanceof Uint8Array ? functionArg.value : functionArg.value.toString();
      }
    }

    return functionArg;
  }

  signAndSubmitTransaction: AptosSignAndSubmitTransactionMethod = async (
    transaction: AptosSignAndSubmitTransactionInput,
  ): Promise<UserResponse<AptosSignAndSubmitTransactionOutput>> => {
    if ('bytecode' in transaction.payload || 'multisigAddress' in transaction.payload) {
      throw new Error('Invalid transaction payload. Currently only entry function payloads are supported.');
    }
    const config = new AptosConfig({
      fullnode: this.activeNetwork.url ?? '',
    });
    const aptos = new Aptos(config);

    const tx = await aptos.transaction.build.simple({
      sender: AccountAddress.from(this.accounts[0].address),
      data: {
        ...transaction.payload,
        functionArguments: transaction.payload.functionArguments.map(LeapAptos.formatFunctionArgument),
      },
      options: {
        gasUnitPrice: transaction.gasUnitPrice,
        maxGasAmount: transaction.maxGasAmount,
      },
    });
    const chainId = `aptos-${tx.rawTransaction.chain_id.chainId}`;
    const serializer = new Serializer();
    serializer.serialize(tx);
    const txBytes = Buffer.from(serializer.toUint8Array()).toString('hex');
    const msg = new RequestSignAptosMsg(chainId, this.accounts[0].address, txBytes, true, false, {
      asFeePayer: false,
      preferNoSetFee: false,
    });
    msg.validateBasic();
    const txHash = await this.requestWrapper(APTOS_METHOD_TYPE.SIGN_TRANSACTION, msg);
    // // THIS LOGIC SHOULD BE REPLACED. IT IS FOR EXAMPLE PURPOSES ONLY.
    // if (asFeePayer) {
    //   const senderAuthenticator = this.aptos.transaction.signAsFeePayer({
    //     signer: this.signer,
    //     transaction,
    //   });

    //   return Promise.resolve({
    //     status: UserResponseStatus.APPROVED,
    //     args: senderAuthenticator,
    //   });
    // }
    // const senderAuthenticator = this.aptos.transaction.sign({
    //   signer: this.signer,
    //   transaction,
    // });

    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        hash: txHash,
      },
    });
  };

  /**
   * @param input - A message to sign with the private key of the connected account.
   * @returns A user response either with a signed message, or the user rejecting to sign.
   */
  signMessage: AptosSignMessageMethod = async (
    input: AptosSignMessageInput,
  ): Promise<UserResponse<AptosSignMessageOutput>> => {
    // // THIS LOGIC SHOULD BE REPLACED. IT IS FOR EXAMPLE PURPOSES ONLY.
    // // 'Aptos' + application + address + nonce + chainId + message
    const chainId = `aptos-${this.activeNetwork.chainId}`;
    let messageToSign = `APTOS`;
    if (input.application) {
      messageToSign += `\napplication: ${this.origin}`;
    }
    if (input.address) {
      messageToSign += `\naddress: ${this.accounts[0].address}`;
    }
    if (input.chainId) {
      messageToSign += `\nchainId: ${this.activeNetwork.chainId}`;
    }
    messageToSign += `\nmessage: ${input.message}`;
    if (input.nonce) {
      messageToSign += `\nnonce: ${input.nonce}`;
    }
    const msg = new RequestSignAptosMsg(chainId, this.accounts[0].address, messageToSign, false, true);
    const signResponse = await this.requestWrapper(APTOS_METHOD_TYPE.SIGN_TRANSACTION, msg);
    const deserializer = new Deserializer(Uint8Array.from(Buffer.from(signResponse, 'hex')));
    const signature = Ed25519Signature.deserialize(deserializer);
    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        address: this.accounts[0].address,
        fullMessage: messageToSign,
        message: input.message,
        nonce: input.nonce,
        application: input.application ? 'Leap Wallet' : undefined,
        chainId: input.chainId ? this.activeNetwork.chainId : undefined,
        prefix: 'APTOS',
        signature,
      },
    });
  };

  changeNetwork: AptosChangeNetworkMethod = async (
    input: AptosChangeNetworkInput,
  ): Promise<UserResponse<AptosChangeNetworkOutput>> => {
    try {
      if (input.chainId === this.activeNetwork.chainId) {
        return Promise.resolve({
          status: UserResponseStatus.APPROVED,
          args: {
            success: true,
            chainId: this.activeNetwork.chainId,
          },
        });
      }
      const chainId = `aptos-${input.chainId}`;
      const existingChainId = `aptos-${this.activeNetwork.chainId}`;
      const response = await this.requestWrapper(APTOS_METHOD_TYPE.SWITCH_NETWORK, { chainId, existingChainId });
      if (!response.success) {
        throw new Error('Failed to switch network');
      }

      this.network();

      return Promise.resolve({
        status: UserResponseStatus.APPROVED,
        args: {
          success: true,
          chainId: input.chainId,
        },
      });
    } catch (e) {
      return Promise.reject({
        status: UserResponseStatus.REJECTED,
      });
    }
  };

  /**
   * An event which will be triggered anytime an Account changes.
   *
   * @returns when the logic is resolved.
   */
  onAccountChange: AptosOnAccountChangeMethod = async (input: AptosOnAccountChangeInput): Promise<void> => {
    window.addEventListener('leap_keystorechange', async () => {
      await this.connect();
      const accountInfo = this.accounts[0].accountInfo;
      input(accountInfo);
    });
    return Promise.resolve();
  };

  /**
   * When users indicate a Network change should occur, update your Wallet accordingly.
   *
   * @returns when the logic is resolved.
   */
  onNetworkChange: AptosOnNetworkChangeMethod = async (input: AptosOnNetworkChangeInput): Promise<void> => {
    window.addEventListener('leap_activeChainInfoChanged', (e) => {
      const { chainId: _chainId, network, restUrl, chainKey } = (e as CustomEvent).detail.data;
      const isAptosChain = _chainId?.startsWith('aptos-');
      const chainId = Number(_chainId?.replace('aptos-', ''));

      if ((isAptosChain && this.activeNetwork.chainId !== chainId) || this.activeNetwork.name !== network) {
        console.log('onNetworkChange', { chainId, network, restUrl, chainKey });
        const networkName = network;
        this.activeNetwork = {
          name: networkName,
          chainId: chainId,
          url: restUrl,
          chainKey: chainKey,
        };
        input({
          name: networkName,
          chainId: chainId,
          url: restUrl,
        });
      }
    });
    return Promise.resolve();
  };
}
