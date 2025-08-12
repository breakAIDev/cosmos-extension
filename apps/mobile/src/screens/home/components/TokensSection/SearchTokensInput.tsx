import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { transition250 } from '../../../../utils/motion-variants';
import { SearchInput } from '../../../../components/ui/input/search-input';

// Height value should fit your SearchInput (usually 48–56)
const SEARCH_INPUT_HEIGHT = 56;

export const SearchTokensInput = ({
  searchQuery,
  setSearchQuery,
  showSearch,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showSearch: boolean;
}) => {
  useEffect(() => {
    if (!showSearch) setSearchQuery('');
  }, [setSearchQuery, showSearch]);

  return (
    <AnimatePresence>
      {showSearch ? (
        <MotiView
          key="searchInput"
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: SEARCH_INPUT_HEIGHT }}
          exit={{ opacity: 0, height: 0 }}
          transition={transition250 || { type: 'timing', duration: 250 }}
          style={styles.animatedView}
        >
          <SearchInput
            autoFocus={true}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by token name"
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
          />
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    overflow: 'hidden',
    width: '100%',
    marginBottom: 20,
  },
  searchInput: {
    width: '100%',
    // Optionally, set height here to match SEARCH_INPUT_HEIGHT
    // height: SEARCH_INPUT_HEIGHT,
  },
});
