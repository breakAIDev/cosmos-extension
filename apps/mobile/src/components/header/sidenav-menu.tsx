import React, { ReactNode } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { MenuIcon } from '../../../assets/icons/menu-icon';
import { globalSheetsStore, SideNavDefaults } from '../../context/global-sheets-store';

type SideNavMenuOpenProps = {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  sideNavDefaults?: SideNavDefaults;
};

export const SideNavMenuOpen: React.FC<SideNavMenuOpenProps> = ({ children, style, sideNavDefaults }) => {
  const toggle = () => globalSheetsStore.toggleSideNav(sideNavDefaults);

  return (
    <TouchableOpacity onPress={toggle} style={style}>
      {children || <MenuIcon />}
    </TouchableOpacity>
  );
};
