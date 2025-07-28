import React from 'react';
import { ViewStyle } from 'react-native';
import { EmptyCard } from '../empty-card';
import { Images } from '../../../assets/images';

interface PropsType {
  searchQuery: string;
  style?: ViewStyle;
}

const NoSearchResults = ({ searchQuery, style }: PropsType) => {
  return (
    <EmptyCard
      isRounded
      subHeading="Please try again with something else"
      heading={`No results for “${searchQuery}”`}
      src={Images.Misc.Explore}
      style={style}
    />
  );
};

export default NoSearchResults;
