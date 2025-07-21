import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/cosmos";
import { Transaction } from "../types/transaction";

export function useTransactions(address: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetchTransactions(address)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [address]);

  return { transactions, loading };
}
