import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { addedAt, endsIn, getHostname } from '../utils';

type Props = {
  endDate: string | undefined;
  additionDate: string;
  relevantLinks: string[];
};

const ListingFooter: React.FC<Props> = ({ endDate, additionDate, relevantLinks }) => {
  return (
    <View style={styles.row}>
      {endDate && addedAt(additionDate) ? (
        <>
          <Text style={styles.text}>{endsIn(endDate)}</Text>
          <Text style={styles.text}> · </Text>
        </>
      ) : null}

      {additionDate && relevantLinks?.[0] ? (
        <>
          <Text style={styles.text}>{addedAt(additionDate)}</Text>
          <Text style={styles.text}> · </Text>
        </>
      ) : additionDate ? (
        <Text style={styles.text}>{addedAt(additionDate)}</Text>
      ) : null}

      {relevantLinks?.[0] && (
        <Text style={styles.text}>{getHostname(relevantLinks[0])}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2, // gap is supported in some RN versions, if not: use marginRight on Text
  },
  text: {
    fontSize: 12,
    color: '#374151', // text-secondary-800
  },
});

export default ListingFooter;
