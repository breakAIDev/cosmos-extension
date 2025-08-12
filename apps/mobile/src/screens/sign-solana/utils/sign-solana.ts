import { calculateFee, StdFee } from '@cosmjs/stargate';
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { getStdFee } from '../../sign-aptos/utils/get-fee';
// If using React Native, import Buffer polyfill:
import { Buffer } from 'buffer';

/**
 * Parses the original Solana sign doc and returns a VersionedTransaction.
 * @param signRequestData - Base64 or Uint8Array encoded transaction data.
 * @param isDisplay - If true, decodes as a message for display.
 */
export function getOriginalSignDoc(signRequestData: any, isDisplay: boolean = false) {
  // If signRequestData is already Uint8Array, skip conversion.
  let tsxBytes: Uint8Array;
  if (typeof signRequestData === 'string') {
    tsxBytes = Buffer.from(signRequestData, 'base64');
  } else if (signRequestData instanceof Uint8Array) {
    tsxBytes = signRequestData;
  } else if (Array.isArray(signRequestData)) {
    tsxBytes = new Uint8Array(signRequestData);
  } else {
    throw new Error('signRequestData must be a base64 string, Uint8Array, or array of numbers');
  }
  const transaction = VersionedTransaction.deserialize(tsxBytes);
  if (isDisplay) {
    return {
      signDoc: transaction,
      signOptions: {},
    };
  }
  return {
    signDoc: transaction,
    signOptions: {},
  };
}

function getDefaultFee(nativeFeeDenom: NativeDenom): StdFee {
  // 5000 is an arbitrary small gas, update as needed for your network.
  return calculateFee(5000, GasPrice.fromString(`0${nativeFeeDenom.coinMinimalDenom}`));
}

function getUpdatedFee(
  defaultFee: StdFee,
  gasLimit: string,
  gasPrice: GasPrice,
  isGasOptionSelected: boolean,
  signOptions?: { preferNoSetFee?: boolean },
) {
  const customGasLimit = new BigNumber(gasLimit);

  const fee =
    signOptions?.preferNoSetFee && !isGasOptionSelected
      ? defaultFee
      : getStdFee(
          !customGasLimit.isNaN() && customGasLimit.isGreaterThan(0) ? customGasLimit.toString() : defaultFee.gas,
          gasPrice,
        );

  // Add fixed compute budget (e.g., +5000 units)
  //@ts-ignore
  fee.amount[0].amount = new BigNumber(fee.amount[0].amount).plus(5000).toString();

  return fee;
}

/**
 * Updates a Solana transaction with new compute unit price and limit.
 * Returns the serialized VersionedTransaction (Uint8Array).
 */
export async function getUpdatedSignDoc(originalSignDocBase64: string, updatedFee: StdFee): Promise<Uint8Array> {
  const originalBuffer = Buffer.from(originalSignDocBase64, 'base64');
  const transaction = VersionedTransaction.deserialize(originalBuffer);

  // Get address lookup tables (ALTs) if used.
  const altLookups = transaction.message.addressTableLookups;
  const lookupTableAccounts: AddressLookupTableAccount[] = [];
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  for (const lookup of altLookups) {
    const altAccountInfo = await connection.getAddressLookupTable(lookup.accountKey);
    if (altAccountInfo.value) {
      lookupTableAccounts.push(altAccountInfo.value);
    } else {
      throw new Error(`Failed to resolve Address Lookup Table: ${lookup.accountKey.toBase58()}`);
    }
  }

  // Decompile message and insert compute unit instructions at the beginning.
  const message = TransactionMessage.decompile(transaction.message, {
    addressLookupTableAccounts: lookupTableAccounts,
  });

  const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: updatedFee && Number(updatedFee.gas) < 20_000 ? 20_000 : Number(updatedFee.gas),
  });

  const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: updatedFee
      ? Math.floor((Number(updatedFee.amount[0].amount) / Number(updatedFee.gas)) * 1_000_000)
      : 0,
  });

  // Add new instructions to the beginning of the message.
  message.instructions.unshift(computeUnitPriceIx, computeUnitLimitIx);

  // Compile and serialize new transaction.
  const compiledMessage = message.compileToV0Message(lookupTableAccounts);
  const newTx = new VersionedTransaction(compiledMessage);

  return newTx.serialize();
}

export function getSolanaSignDoc({
  signRequestData,
  gasPrice,
  gasLimit,
  isGasOptionSelected,
  nativeFeeDenom,
}: {
  signRequestData: Record<string, any>;
  gasPrice: GasPrice;
  gasLimit: string;
  isGasOptionSelected: boolean;
  nativeFeeDenom: NativeDenom;
}) {
  const { signOptions } = getOriginalSignDoc(signRequestData.signDoc);
  const defaultFee = getDefaultFee(nativeFeeDenom);
  const updatedFee = getUpdatedFee(defaultFee, gasLimit, gasPrice, isGasOptionSelected, signOptions);

  return {
    updatedSignDoc: signRequestData.signDoc,
    updatedFee,
    allowSetFee: false,
    defaultFee: updatedFee,
    defaultMemo: '',
  };
}
