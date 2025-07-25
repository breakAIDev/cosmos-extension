import { makeSignDoc as createSignAminoDoc, OfflineAminoSigner } from '@cosmjs/amino';
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate';
import { fromBase64 } from '@cosmjs/encoding';
import { Int53 } from '@cosmjs/math';
import { makeAuthInfoBytes, Registry, type TxBodyEncodeObject } from '@cosmjs/proto-signing';
import { AminoTypes, defaultRegistryTypes, StdFee } from '@cosmjs/stargate';
import {
  createDefaultAminoConverters,
  encodeEthSecp256k1Pubkey,
  encodePubkeyInitia,
  fetchAccountDetails,
  LeapLedgerSignerEth,
  signEIP191,
} from '@leapwallet/cosmos-wallet-sdk';
import { initiaAminoConverters } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/initia/client';
import { MsgInitiateTokenDeposit } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/initia/opinit/ophost/tx';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { SourceChain } from 'types/swap';

export async function handleInitiaTx(
  encodedMessage: { typeUrl: string; value: MsgTransfer },
  fee: StdFee,
  messageChain: SourceChain,
  wallet: LeapLedgerSignerEth,
  senderAddress: string,
  memo = '',
) {
  let txRaw;
  let txBytesString;
  const accountDetails = await fetchAccountDetails(messageChain.restUrl ?? '', senderAddress);
  const walletAccounts = await wallet.getAccounts();
  const aminoTypes = new AminoTypes({
    ...createDefaultAminoConverters('cosmos'),
    ...createWasmAminoConverters(),
    ...initiaAminoConverters,
  });
  const accountFromSigner = walletAccounts[0];

  const msgs = [aminoTypes.toAmino(encodedMessage)];

  if (encodedMessage.value.memo) {
    msgs[0].value.memo = encodedMessage.value.memo;
  }

  if (!msgs[0].value.data || msgs[0].value.data === '') {
    delete msgs[0].value.data;
  }
  const signAminoDoc = createSignAminoDoc(
    msgs,
    fee,
    String(messageChain.chainId),
    memo,
    accountDetails.accountNumber,
    accountDetails.sequence,
  );

  const signedAminoDoc = await signEIP191(senderAddress, signAminoDoc, wallet);

  if ('signed' in signedAminoDoc && 'signature' in signedAminoDoc) {
    const signedTxBody = {
      messages: signedAminoDoc.signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: signedAminoDoc.signed.memo,
    };

    if (msgs[0].value.memo) {
      signedTxBody.messages[0].value.memo = msgs[0].value.memo;
    }

    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    };
    const registry = new Registry(defaultRegistryTypes);
    registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract);
    registry.register('/opinit.ophost.v1.MsgInitiateTokenDeposit', MsgInitiateTokenDeposit as any);
    const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject);

    const signedGasLimit = Int53.fromString(signedAminoDoc.signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signedAminoDoc.signed.sequence).toNumber();

    const pubkey = encodePubkeyInitia(encodeEthSecp256k1Pubkey(accountFromSigner.pubkey));
    const signMode = SignMode.SIGN_MODE_EIP_191;

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signedAminoDoc.signed.fee.amount,
      signedGasLimit,
      signedAminoDoc.signed.fee.granter,
      signedAminoDoc.signed.fee.payer,
      signMode,
    );
    txRaw = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signedAminoDoc.signature.signature)],
    });
    const txBytes = TxRaw.encode(txRaw).finish();
    txBytesString = Buffer.from(txBytes).toString('base64');
  } else {
    txRaw = signedAminoDoc;
    const txBytes = TxRaw.encode(txRaw).finish();
    txBytesString = Buffer.from(txBytes).toString('base64');
  }
  return { txRaw, txBytesString };
}
