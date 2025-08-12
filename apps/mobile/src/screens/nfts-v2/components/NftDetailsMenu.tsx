import { Images } from '../../../../assets/images';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type NftDetailsMenuProps = {
  handleProfileClick: VoidFunction;
  isInProfile: boolean;
  showProfileOption: boolean;
  handleHideNftClick: VoidFunction;
  isInHiddenNfts: boolean;
};

export function NftDetailsMenu({
  handleProfileClick,
  isInProfile,
  showProfileOption,
  handleHideNftClick,
  isInHiddenNfts,
}: NftDetailsMenuProps) {
  // Responsive width
  const width = 344;

  return (
    <View style={[styles.menu, { width }]}>
      {showProfileOption && (
        <TouchableOpacity style={styles.row} onPress={handleProfileClick} activeOpacity={0.8}>
          <Image
            source={{uri: Images.Misc.NftProfile}}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>
            {isInProfile ? 'Remove from' : 'Set as'} profile avatar
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.row} onPress={handleHideNftClick} activeOpacity={0.8}>
        {isInHiddenNfts ? (
          <>
            <Image
              source={{uri: Images.Misc.UnhideNft}}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>Unhide NFT</Text>
          </>
        ) : (
          <>
            <Image
              source={{uri: Images.Misc.HideNft}}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>Hide NFT</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#f3f4f6',
    backgroundColor: '#f3f4f6',
    // For dark mode: override with theme if needed
    paddingVertical: 0,
    paddingHorizontal: 0,
    zIndex: 100,
    top: 0, // Set as needed
    left: 0, // Set as needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    // "invert" for dark mode would require a custom style or color swap logic
  },
  menuText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '500',
  },
});
