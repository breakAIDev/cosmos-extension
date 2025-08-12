import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import BottomModal from '../../../components/new-bottom-modal';
import { Separator } from '../../../components/ui/separator';
import { PageName } from '../../../services/config/analytics';
import { AlphaOpportunityProps } from './alpha-timeline';
import AlphaDescription from './AlphaDescription';
import ListingFooter from './ListingFooter';
import ListingImage from './ListingImage';
import Tags from './Tags';

type AlphaDetailsDrawerProps = {
  isShown: boolean;
  onClose: () => void;
  opportunity: AlphaOpportunityProps | null;
};

export default function AlphaDetailsDrawer({
  isShown,
  onClose,
  opportunity,
}: AlphaDetailsDrawerProps) {
  const handleExternalLinkClick = () => {
    const alphaExternalURL = opportunity?.relevantLinks?.[0];
    if (alphaExternalURL) {
      Linking.openURL(alphaExternalURL);
    }
  };

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title="Post"
      style={styles.modal}
    >
      <TouchableOpacity
        onPress={handleExternalLinkClick}
        activeOpacity={opportunity?.relevantLinks?.[0] ? 0.8 : 1}
        style={[
          styles.row,
          opportunity?.relevantLinks?.[0] && styles.cursorPointer,
        ]}
        disabled={!opportunity?.relevantLinks?.[0]}
      >
        <View style={{ flex: 1 }}>
          <Tags
            visibilityStatus={opportunity?.visibilityStatus}
            ecosystemFilter={opportunity?.ecosystemFilter ?? []}
            categoryFilter={opportunity?.categoryFilter ?? []}
          />

          <Text style={styles.title}>{opportunity?.homepageDescription}</Text>

          <ListingFooter
            endDate={opportunity?.endDate}
            additionDate={opportunity?.additionDate ?? ''}
            relevantLinks={opportunity?.relevantLinks ?? []}
          />
        </View>

        <View style={styles.imageContainer}>
          <ListingImage
            ecosystemFilter={opportunity?.ecosystemFilter?.[0]}
            categoryFilter={opportunity?.categoryFilter?.[0]}
            image={opportunity?.image}
          />
        </View>
      </TouchableOpacity>

      <Separator style={styles.separator} />

      {/* Description actions section */}
      {opportunity?.descriptionActions && opportunity?.descriptionActions !== 'NA' ? (
        <AlphaDescription {...opportunity} pageName={PageName.Alpha} />
      ) : null}
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    marginBottom: 12,
  },
  cursorPointer: {
    // no real "cursor:pointer" in RN, but you could add visual feedback
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#18181b',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    marginVertical: 8,
  },
});
