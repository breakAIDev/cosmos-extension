import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Image, StyleSheet, Linking } from 'react-native'
import { ArrowSquareOut, Info, X } from 'phosphor-react-native'
import Text from '../../components/text'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { formatForSubstring } from '../../utils/strings'

import { ClaimableRewardInfo } from './components/ClaimableRewardInfo'
import { LastUpdatedScoreInfo } from './components/LastUpdatedScoreInfo'
import { RollupSkeleton } from './components/RollupSkeleton'
import { VipGaugeInfo } from './components/VipGaugeInfo'
import { VipRewardsInfo } from './components/VipRewardsInfo'
import { useVipData } from './useVipData'
import { Skeleton } from '../../components/ui/skeleton'

const InitiaVip = observer(() => {
  // Replace usePageView hook if you track analytics in RN
  const [isLastUpdatedScoreInfoOpen, setIsLastUpdatedScoreInfoOpen] = useState(false)
  const [isClaimableRewardInfoOpen, setIsClaimableRewardInfoOpen] = useState(false)
  const [isVipRewardsInfoOpen, setIsVipRewardsInfoOpen] = useState(false)
  const [isVipGaugeInfoOpen, setIsVipGaugeInfoOpen] = useState(false)
  const navigation = useNavigation()

  const {
    isLoading,
    data: { rollupList, totalClaimableReward, votingEndsIn },
  } = useVipData()

  const handleClose = () => {
    navigation.goBack()
  }

  const handleClaim = () => {
    Linking.openURL('https://app.initia.xyz/vip')
  }

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 20, height: 20 }} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} color="text-black-100">
            VIP Rewards
          </Text>
          <TouchableOpacity onPress={() => setIsVipRewardsInfoOpen(true)}>
            <Info size={20} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleClose}>
          <X size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* Voting ends in */}
        <View style={styles.centeredSection}>
          <Text size="md" color="text-gray-600">
            Current gauge vote ends in
          </Text>
          {isLoading ? (
            <Skeleton width={150} height={20} />
          ) : (
            <Text color="text-black-100" size="xl" style={{ fontWeight: 'bold' }}>
              {votingEndsIn}
            </Text>
          )}
        </View>

        {/* Claimable Rewards Card */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <Text style={{ fontWeight: 'bold' }} size="sm" color="text-black-100">
              Claimable rewards
            </Text>
            <TouchableOpacity onPress={() => setIsClaimableRewardInfoOpen(true)}>
              <Info size={16} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View>
              <Skeleton height={16} />
              <Skeleton width={120} height={16} />
            </View>
          ) : totalClaimableReward > 0 ? (
            <View style={styles.cardRow}>
              <View>
                <Text size="xs" color="text-gray-600">
                  Total claimable
                </Text>
                <View style={styles.rowCenter}>
                  <Text color="text-green-600" size="lg" style={{ fontWeight: 'bold' }}>
                    {formatForSubstring(totalClaimableReward.toString())}
                  </Text>
                  <Text color="text-gray-600" size="md" style={{ marginLeft: 4 }}>
                    INIT
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
                <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: 6 }}>Claim now</Text>
                <ArrowSquareOut size={14} color="#fff" weight="bold" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text size="sm" color="text-gray-600">
              No rewards available to claim. Engage with the rollups below to earn rewards.
            </Text>
          )}
        </View>

        {/* Rollups */}
        <View style={{ padding: 24, paddingBottom: 0 }}>
          <View style={styles.rowCenter}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }} size="md" color="text-black-100">
              Rollups
            </Text>
            <TouchableOpacity onPress={() => setIsVipGaugeInfoOpen(true)}>
              <Info size={16} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <>
              <RollupSkeleton />
              <RollupSkeleton />
            </>
          ) : (
            rollupList.map((rollup) => (
              <TouchableOpacity
                key={rollup.name}
                style={styles.rollupCard}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(rollup.website)}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.rowStart}>
                    <Image source={{ uri: rollup.logo }} style={styles.logo} />
                    <View>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }} size="md" color="text-black-100">
                        {rollup.prettyName}
                      </Text>
                      <Text style={{ fontWeight: '500' }} size="xs" color="text-gray-600">
                        Gauge vote: {(rollup.votePercent * 100).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRow}>
                    <View>
                      <View style={styles.rowCenter}>
                        <Text size="xs" color="text-gray-600">
                          Last updated score
                        </Text>
                        <TouchableOpacity onPress={() => setIsLastUpdatedScoreInfoOpen(true)}>
                          <Info size={12} color="#A0AEC0" />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontWeight: 'bold' }} size="sm" color="text-black-100">
                        {formatForSubstring(rollup.lastUpdatedScore.toString())}
                      </Text>
                    </View>
                    <View>
                      <Text size="xs" color="text-gray-600">
                        Claimable rewards
                      </Text>
                      <Text size="sm" color="text-green-600">
                        <Text style={{ fontWeight: 'bold' }}>{formatForSubstring(rollup.claimableReward.toString())}</Text>
                        {' '}INIT
                      </Text>
                    </View>
                  </View>
                </View>
                <ArrowSquareOut size={20} color="#A0AEC0" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <LastUpdatedScoreInfo isOpen={isLastUpdatedScoreInfoOpen} onClose={() => setIsLastUpdatedScoreInfoOpen(false)} />
      <ClaimableRewardInfo isOpen={isClaimableRewardInfoOpen} onClose={() => setIsClaimableRewardInfoOpen(false)} />
      <VipRewardsInfo isOpen={isVipRewardsInfoOpen} onClose={() => setIsVipRewardsInfoOpen(false)} />
      <VipGaugeInfo isOpen={isVipGaugeInfoOpen} onClose={() => setIsVipGaugeInfoOpen(false)} />
    </>
  )
})

export default InitiaVip

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // bg-secondary-100
    borderBottomWidth: 1,
    borderColor: '#e5e7eb', // border-secondary-200
    justifyContent: 'space-between',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 6,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredSection: {
    alignItems: 'center',
    marginVertical: 22,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  claimButton: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollupCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginTop: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
})
