import React from 'react'
import BottomModal from '../../../components/new-bottom-modal'
import Text from '../../../components/text'
import { View, StyleSheet } from 'react-native'

export const LastUpdatedScoreInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Last updated score">
      <View style={styles.content}>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          The Last Updated Score shows your most recent VIP Score. It measures how active and engaged you are in the Initia ecosystem up to the last epoch. Your score is key to figuring out how much of the earned esINIT you can unlock.
        </Text>
      </View>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
  },
  paragraph: {
    lineHeight: 24,
  },
})

export default LastUpdatedScoreInfo
