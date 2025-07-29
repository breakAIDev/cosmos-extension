import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
// If using react-native-dotenv or @env for env variables:
import { LEAP_WALLET_BACKEND_API_URL } from "@env"; // See note below

export default function useGetTopCGTokens() {
  return useQuery(
    ['explore-tokens'],
    async () => {
      const res = await axios.get(
        `${LEAP_WALLET_BACKEND_API_URL}/market/changes?currency=USD&ecosystem=cosmos-ecosystem`
      );
      return res?.data;
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  );
}
