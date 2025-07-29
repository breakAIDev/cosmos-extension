import { ActivityCardContent, useActivity } from '@leapwallet/cosmos-wallet-hooks';
import { AnkrChainMapStore, ChainTagsStore, IbcTraceFetcher } from '@leapwallet/cosmos-wallet-store';
import type { ParsedTransaction } from '@leapwallet/parser-parfait';
import { QueryStatus } from '@tanstack/react-query';
import { usePerformanceMonitor } from '../../../hooks/perf-monitoring/usePerformanceMonitor';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { GeneralActivity } from './index';

export type SelectedTx = {
  parsedTx: ParsedTransaction;
  content: ActivityCardContent;
};

type ChainActivityProps = {
  chainTagsStore: ChainTagsStore;
  ankrChainMapStore: AnkrChainMapStore;
  ibcTraceFetcher: IbcTraceFetcher;
};

const ChainActivity = observer(({ chainTagsStore, ankrChainMapStore, ibcTraceFetcher }: ChainActivityProps) => {
  const txResponse = useActivity(ankrChainMapStore.ankrChainMap, ibcTraceFetcher);

    const queryStatus: QueryStatus = useMemo(() => {
      if (txResponse.error) return 'error';
      if (txResponse.loading) return 'loading';
      return 'success';
    }, [txResponse]);

  usePerformanceMonitor({
    page: 'activity',
    queryStatus: queryStatus as QueryStatus,
    op: 'activityPageLoad',
    description: 'loading state on activity page',
  });

  return <GeneralActivity txResponse={txResponse} chainTagsStore={chainTagsStore} />;
});

ChainActivity.displayName = 'ChainActivity';
export { ChainActivity };
