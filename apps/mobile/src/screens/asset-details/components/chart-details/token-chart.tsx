import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useformatCurrency } from '@leapwallet/cosmos-wallet-hooks';
import { MarketChartPrice } from '@leapwallet/cosmos-wallet-hooks';
import { AreaChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { BigNumber } from 'bignumber.js';

type TokensChartProps = {
  chartData: MarketChartPrice[];
  loadingCharts: boolean;
  price: number;
  chainColor: string;
  minMax: MarketChartPrice[];
  selectedDays: string;
};

export function TokensChart({
  chartData,
  loadingCharts,
  price,
  chainColor,
  minMax,
  selectedDays,
}: TokensChartProps) {
  const [formatCurrency] = useformatCurrency();

  // Format data for AreaChart
  const data = useMemo(() => chartData?.map(d => d.price) ?? [], [chartData]);

  // For gradients in AreaChart
  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id={'gradient'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
        <Stop offset={'0%'} stopColor={chainColor} stopOpacity={0.55} />
        <Stop offset={'100%'} stopColor={chainColor} stopOpacity={0} />
      </LinearGradient>
    </Defs>
  );

  // Custom Tooltip - this is just a placeholder, see below for better UX
  // For a full-featured tooltip use libraries or handle touch events
  const renderTooltip = () => null; // You can implement your own Tooltip

  if (!chartData || loadingCharts || !price) {
    return <View style={{ height: 128, backgroundColor: 'transparent' }} />;
  }

  return (
    <View style={{ height: 128, marginVertical: 4 }}>
      <AreaChart
        style={{ height: 128 }}
        data={data}
        contentInset={{ top: 24, bottom: 8 }}
        curve={shape.curveMonotoneX}
        svg={{
          fill: 'url(#gradient)',
          stroke: chainColor,
          strokeWidth: 2,
        }}
      >
        <Grid />
        <Gradient />
        {/* Place your custom Tooltip here */}
      </AreaChart>
      {/* Optionally, display latest price and date below chart */}
      <View style={styles.infoBar}>
        <Text style={styles.priceText}>
          {formatCurrency ? formatCurrency(new BigNumber(price), 5) : price}
        </Text>
        {/* You could show date range, or details if desired */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBar: {
    marginTop: 4,
    alignItems: 'center',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
});
