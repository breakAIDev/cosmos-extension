import React from 'react'
import { View, StyleSheet } from 'react-native'
import BottomModal from '../../../components/new-bottom-modal'
import Text from '../../../components/text'

export const VipGaugeInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="VIP Gauge">
      <View style={styles.content}>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          A VIP Gauge helps decide how rewards from the Weight Pool are distributed among different Layer 2 chains (rollups) in the Initia ecosystem.
        </Text>
        <Text style={[styles.paragraph, styles.secondary]}>
          {`Each `}
          <Text style={styles.bold}>whitelisted rollup</Text>
          {` has its own gauge, and the more votes it gets, the bigger the share of rewards it receives.`}
          
        </Text>
        <Text size="md" color="text-black-100" style={styles.boldTitle}>
          How Does It Work?
        </Text>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          You can use your voting power to vote for rollups. You can choose one or split your votes across multiple rollups.
        </Text>
        <Text color="text-gray-800" size="sm" style={styles.paragraph}>
          The more votes a rollup gets, the larger the share of rewards it and its users (including you) will receive.
        </Text>
        <Text style={[styles.paragraph, styles.secondary]}>
          This system ensures that{' '}
          <Text style={styles.bold}>your votes</Text>{' '}
          help shape the Initia ecosystem while maximizing your rewards.
        </Text>
      </View>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    paddingVertical: 4,
    gap: 28, // not supported natively, use marginBottom on children if needed
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 24,
    color: '#2d3142', // gray-800 fallback if your Text doesn't handle color prop
    marginBottom: 16,
  },
  secondary: {
    color: '#2d3142',
    fontSize: 14,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#101828', // black-100, or adjust to match your palette
  },
  boldTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },
})

export default VipGaugeInfo
