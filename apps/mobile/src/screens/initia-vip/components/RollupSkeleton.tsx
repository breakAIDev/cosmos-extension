import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Skeleton } from '../../../components/ui/skeleton'

export const RollupSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.rowCenter}>
        <Skeleton width={40} height={40} borderRadius={20} style={styles.skeletonCircle} />
        <Skeleton width={200} height={20} />
      </View>
      <View style={styles.rowBetween}>
        <Skeleton width={150} height={12} />
        <Skeleton width={150} height={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 20,
    gap: 20,
    width: '100%',
    height: 136,
    borderRadius: 16,
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    marginBottom: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skeletonCircle: {
    marginRight: 12,
  },
})

export default RollupSkeleton
