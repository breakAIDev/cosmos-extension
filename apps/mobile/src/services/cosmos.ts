import { SigningStargateClient } from "@cosmjs/stargate";
import { RPC_ENDPOINT, DENOM } from "../utils/constants";

export const getBalance = async (address: string): Promise<string> => {
  const client = await SigningStargateClient.connect(RPC_ENDPOINT);
  const balance = await client.getBalance(address, DENOM);
  return (parseInt(balance.amount) / 1e6).toString(); // uatom to ATOM
};

export const sendTokens = async (
  mnemonic: string,
  recipient: string,
  amount: string
): Promise<string> => {
  const { DirectSecp256k1HdWallet } = await import("@cosmjs/proto-signing");
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "cosmos" });
  const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, wallet);
  const [sender] = await wallet.getAccounts();
  const sendResult = await client.sendTokens(
    sender.address,
    recipient,
    [
      {
        denom: DENOM,
        amount: (parseFloat(amount) * 1e6).toFixed(0),
      },
    ],
    { amount: [{ denom: DENOM, amount: "500" }], gas: "200000" }
  );
  return sendResult.transactionHash;
};

export const fetchTransactions = async (address: string) => {
  // Real implementation should use a Cosmos explorer API or LCD endpoint.
  return [];
};
