import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarBlank } from 'phosphor-react-native'; // Replace with RN icon if needed
import Text from '../../../components/text';
import { format } from 'date-fns';

interface ClaimPeriodProps {
  claimStartDate: Date | null;
  claimEndDate: Date | null;
  isClaimPeriodOver: boolean;
}

export default function ClaimPeriod({
  claimStartDate,
  claimEndDate,
  isClaimPeriodOver,
}: ClaimPeriodProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* If you use RN vector icons, replace this with e.g. Feather/FontAwesome */}
        <CalendarBlank size={20} color="#222" style={styles.icon} />
        <Text style={styles.headerText}>Claim period</Text>
      </View>

      <View style={styles.infoBox}>
        {isClaimPeriodOver && (
          <Text style={styles.periodOverText}>
            Claim period of this Airdrop has passed.
          </Text>
        )}
        <Text style={styles.periodDateText}>
          {!claimStartDate
            ? "The claim period of this airdrop hasn’t been announced yet. Stay tuned for more details."
            : `${format(claimStartDate, 'dd MMM, yyyy')} - ${
                claimEndDate ? format(claimEndDate, 'dd MMM, yyyy') : ''
              }`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#F7F8FA', // secondary-100
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222', // black-100
  },
  infoBox: {
    flexDirection: 'column',
    gap: 4,
  },
  periodOverText: {
    fontSize: 14,
    color: '#8A94A6', // muted-foreground
    fontWeight: '500',
    marginBottom: 2,
  },
  periodDateText: {
    fontSize: 14,
    color: '#8A94A6', // muted-foreground
    fontWeight: '500',
  },
});
