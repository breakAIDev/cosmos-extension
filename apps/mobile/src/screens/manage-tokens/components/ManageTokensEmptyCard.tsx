import { Buttons } from '@leapwallet/leap-ui';
import { EmptyCard } from '../../../components/empty-card';
import { Images } from '../../../../assets/images';
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type ManageTokensEmptyCardProps = {
  onAddTokenClick: (passState?: boolean) => void;
  searchedText: string;
};

export function ManageTokensEmptyCard({ onAddTokenClick, searchedText }: ManageTokensEmptyCardProps) {
  let subHeading: React.ReactNode = (
    <View style={styles.row}>
      <Text style={styles.subText}>
        Or manually add token data{' '}
      </Text>
      <TouchableOpacity onPress={() => onAddTokenClick(false)}>
        <Text style={styles.linkText}>here</Text>
      </TouchableOpacity>
    </View>
  );

  if (searchedText) {
    subHeading = (
      <View>
        <Text style={styles.subText}>Try manually adding tokens instead</Text>
        <Buttons.Generic
          onClick={() => onAddTokenClick(true)}
          style={styles.manualBtn}
        >
          <Text style={styles.manualBtnText}>Add Tokens Manually</Text>
        </Buttons.Generic>
      </View>
    );
  }

  return (
    <EmptyCard
      isRounded
      subHeading={subHeading}
      heading={
        <Text style={styles.headingText}>
          {searchedText ? 'No results found' : 'Search for any token'}
        </Text>
      }
      style={styles.flexCenter}
      src={Images.Misc.Explore}
    />
  );
}

const styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  subText: {
    fontSize: 13,
    color: '#5a5a5a',
  },
  linkText: {
    color: '#ad4aff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 2,
    textDecorationLine: 'underline',
  },
  headingText: {
    fontSize: 15,
    color: '#171717',
    fontWeight: '500',
    textAlign: 'center',
  },
  manualBtn: {
    maxWidth: 200,
    marginTop: 16,
    backgroundColor: '#f3f3fa',
    alignSelf: 'flex-start',
    boxShadow: 'none', // has no effect in React Native but included for parity
  },
  manualBtnText: {
    color: '#2d3142',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
