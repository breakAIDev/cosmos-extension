import { useRoute, useNavigation } from '@react-navigation/native';

export default function useQuery<T extends object = Record<string, any>>(): T {
  const route = useRoute();
  return (route.params as T) || {} as T;
}

// Similar "useQueryParams" for React Navigation v6+
export const useQueryParams = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const get = (key: string) => (route.params ? route.params[key] : undefined);

  const set = (key: string, value: string) => {
    navigation.setParams({ [key]: value });
  };

  const remove = (key: string | string[]) => {
    let params = { ...(route.params || {}) };
    if (Array.isArray(key)) {
      key.forEach(k => delete params[k]);
    } else {
      delete params[key];
    }
    navigation.setParams(params);
  };

  // Debounced set: use lodash.debounce or your own debounce
  const debouncedSet = set; // For brevity; can implement debounce as needed.

  return {
    params: route.params,
    get,
    set,
    remove,
    debouncedSet,
  };
};
