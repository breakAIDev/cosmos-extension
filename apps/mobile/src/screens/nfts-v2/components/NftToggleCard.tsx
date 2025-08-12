import { GenericCard, GenericCardProps, Toggle } from '@leapwallet/leap-ui';
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

export type NftToggleCardProps = Omit<GenericCardProps, 'onClick'> & {
  readonly avatar: ReactNode;
  readonly onClick: (isEnable: boolean) => void;
  readonly isEnabled: boolean;
};

export function NftToggleCard({
  avatar,
  title,
  size,
  isRounded,
  isEnabled,
  onClick,
  ...rest
}: NftToggleCardProps) {
  return (
    <GenericCard
      img={<View style={styles.avatarWrap}>{React.isValidElement(avatar) ? avatar : <View/>}</View>}
      title={title}
      size={size}
      icon={<Toggle checked={isEnabled} onChange={onClick} />}
      isRounded={isRounded}
      // Add style or theme support as needed
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
