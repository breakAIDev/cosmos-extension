import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useQueryCached<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFunction: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn' | 'queryKey'>,
): UseQueryResult<TData, TError> {
  const queryData = useQuery(
    queryKey,
    async (qk) => {
      const storageKey = JSON.stringify(qk.queryKey);
      try {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached !== null) {
          return JSON.parse(cached) as TQueryFnData;
        }
      } catch (err) {
        console.warn('Failed to read from AsyncStorage:', err);
      }

      const data = await queryFunction(qk);

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      } catch (err) {
        console.warn('Failed to write to AsyncStorage:', err);
      }

      return data;
    },
    options,
  );

  return queryData;
}
