import React from 'react'
import { View, StyleSheet } from 'react-native'
import BottomModal from '../../../components/new-bottom-modal'
import Text from '../../../components/text'

export const VipRewardsInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="What are VIP rewards?">
      <View style={styles.container}>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          The Vested Interest Program (VIP) is Initia’s way to reward you for participating in their interwoven
          ecosystem. You get INIT rewards from two pools:
        </Text>
        <View style={styles.poolList}>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>1. The Balance Pool:</Text>
            {' '}It’s the amount of opINIT held on the rollup which determines the share of esINIT balance pool reward.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>2. The Weight Pool:</Text>
            {' '}If you hold INIT and Enshrined Liquidity Tokens, you can vote in the gauge system to send emissions to a
            specific rollup.
          </Text>
        </View>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          VIP rewards you for being active in liquidity and governance. The more you participate, the more you earn.
        </Text>
      </View>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // mimic gap-7 (~28px), use marginBottom on children in RN
  },
  poolList: {
    flexDirection: 'column',
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2d3142', // fallback for gray-800
    marginBottom: 14, // adjust to your preferred spacing
  },
  bold: {
    fontWeight: 'bold',
    color: '#101828', // fallback for black-100
  },
})

export default VipRewardsInfo
