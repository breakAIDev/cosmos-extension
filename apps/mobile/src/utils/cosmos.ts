import { SigningStargateClient } from "@cosmjs/stargate";

export const getBalance = async (rpcEndpoint: string, address: string, denom: string) => {
  const client = await SigningStargateClient.connect(rpcEndpoint);
  const balance = await client.getBalance(address, denom);
  return balance.amount;
};
