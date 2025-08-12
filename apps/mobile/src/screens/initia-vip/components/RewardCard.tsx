import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { CaretRight } from 'phosphor-react-native'

import Text from '../../../components/text'
import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { useSelectedNetwork } from '../../../hooks/settings/useNetwork'
import { Images } from '../../../../assets/images'
import { formatForSubstring } from '../../../utils/strings'
import { useVipData } from '../useVipData'

export const RewardCard = observer(({ chainTagsStore }: { chainTagsStore: any }) => {
  const chainInfo = useChainInfo()
  const selectedNetwork = useSelectedNetwork()
  const navigation = useNavigation<any>()
  const tags = chainTagsStore.allChainTags[chainInfo?.chainId]
  const {
    isLoading,
    data: { votingEndsIn, totalClaimableReward },
  } = useVipData()
  const daysUntilVotingEnds = +votingEndsIn.split('d:')[0] || 0
  const hoursUntilVotingEnds = +votingEndsIn.split('d:')[1]?.split('h:')[0] || 0
  const minutesUntilVotingEnds = +votingEndsIn.split('d:')[1]?.split('h:')[1]?.split('m')[0] || 0

  const handleClick = () => {
    navigation.navigate('InitiaVIP') // replace with your route name
  }

  if (!tags || !tags.includes('Initia') || selectedNetwork === 'testnet') return null

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity style={styles.card} onPress={handleClick} activeOpacity={0.8}>
        <View style={styles.leftSection}>
          <Image
            source={{uri:Images.Misc.PersonPlay}}
            style={styles.avatar}
            resizeMode="contain"
          />
          <View style={styles.textBlock}>
            <Text color="text-black-100" style={styles.bold} size="sm">
              VIP rewards
            </Text>
            {isLoading ? (
              <View style={styles.skeleton} />
            ) : totalClaimableReward > 0 ? (
              <View style={styles.rewardRow}>
                <Text color="text-green-600" size="sm" style={styles.medium}>
                  {formatForSubstring(totalClaimableReward.toString())}
                </Text>
                <Text color="text-gray-600" size="xs" style={{ marginLeft: 4 }}>
                  INIT claimable
                </Text>
              </View>
            ) : (
              <Text color="text-gray-600" size="xs">
                {daysUntilVotingEnds > 0
                  ? `${daysUntilVotingEnds} ${daysUntilVotingEnds === 1 ? 'day' : 'days'} until this stage ends`
                  : hoursUntilVotingEnds > 0
                  ? `${hoursUntilVotingEnds} ${hoursUntilVotingEnds === 1 ? 'hour' : 'hours'} until this stage ends`
                  : `${minutesUntilVotingEnds} ${minutesUntilVotingEnds === 1 ? 'minute' : 'minutes'} until this stage ends`}
                
              </Text>
            )}
          </View>
        </View>
        <CaretRight
          size={28}
          color="#64748b"
          style={styles.caret}
          weight="bold"
        />
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 28,
    width: '100%',
    marginTop: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f2f6fa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#e7ecfa',
    marginRight: 12,
  },
  textBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  medium: {
    fontWeight: '500',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  skeleton: {
    width: 48,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginTop: 8,
  },
  caret: {
    backgroundColor: '#dde3ea',
    borderRadius: 16,
    padding: 4,
  },
})

export default RewardCard
