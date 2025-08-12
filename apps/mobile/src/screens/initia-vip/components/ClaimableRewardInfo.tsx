import React from 'react'
import BottomModal from '../../../components/new-bottom-modal'
import Text from '../../../components/text'
import { View, StyleSheet } from 'react-native'

export const ClaimableRewardInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Claimable rewards">
      <View style={styles.content}>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          esINIT are non-transferable tokens you earn as rewards through the Initia VIP program. They come from the Balance Pool (based on your INIT holdings) and the Weight Pool (based on L1 gauge votes).
        </Text>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          To unlock esINIT, you need to keep a high VIP Score or use locked liquidity positions.
        </Text>
      </View>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    gap: 28, // 7 * 4px (React Native doesn't support `gap` directly in View, see note below)
    paddingVertical: 4,
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: 12, // fallback for gap if needed
  },
})

export default ClaimableRewardInfo
