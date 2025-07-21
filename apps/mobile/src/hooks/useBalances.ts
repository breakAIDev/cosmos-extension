import { useEffect, useState } from "react";
import { getBalance } from "../services/cosmos";

export function useBalances(address: string) {
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    if (!address) return;
    (async () => {
      setBalance(null);
      setBalance(await getBalance(address));
    })();
  }, [address]);
  return balance;
}
