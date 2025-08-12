import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { GenericCard, GenericCardProps, Toggle } from '@leapwallet/leap-ui';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../assets/images';

type CustomToggleCardProps = GenericCardProps & {
  imgSrc?: string;
  TokenType?: React.ReactNode;
  onToggleChange: (isEnabled: boolean) => void;
  isToggleChecked: boolean;
  style?: StyleProp<ViewStyle>;
  onDeleteClick: () => void;
  imageStyle?: StyleProp<ImageStyle>;
};

export function CustomToggleCard({
  title,
  subtitle,
  isRounded,
  imgSrc,
  TokenType,
  onToggleChange,
  isToggleChecked,
  onDeleteClick,
  style,
  imageStyle,
}: CustomToggleCardProps) {
  const defaultTokenLogo = useDefaultTokenLogo();

  return (
    <GenericCard
      title={title}
      subtitle={
        <Text>
          {subtitle} {React.isValidElement(TokenType) ? TokenType : <View/>}
        </Text>
      }
      isRounded={isRounded}
      size="md"
      img={
        <Image
          source={{ uri: imgSrc ?? defaultTokenLogo}}
          style={[styles.image, imageStyle]}
          resizeMode="contain"
        />
      }
      icon={
        <View style={[styles.iconRow, style]}>
          <Toggle checked={isToggleChecked} onChange={onToggleChange} />
          <View style={styles.divider} />
          <TouchableOpacity onPress={onDeleteClick} style={styles.deleteBtn}>
            <Image source={{uri: Images.Misc.DeleteRed}} style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  image: {
    height: 32,
    width: 32,
    marginRight: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 36,
    width: 1,
    backgroundColor: '#e5e7eb', // gray-200, adjust if needed for dark mode
    marginHorizontal: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    // Optional: tintColor: 'red' if needed for theming
  },
});
