import React from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Label, ThemeName, useTheme } from '@leapwallet/leap-ui';
import IconButton from '../icon-button';
import { Images } from '../../../assets/images';
import { LeapLogo } from '../../../assets/images/logos';

type ExtensionPageProps = {
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  headerRightComponent?: React.ReactNode;
  childrenMargin?: boolean;
};

const HELP_CENTER_URL = 'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee';

export default function ExtensionPage(props: ExtensionPageProps) {
  const { titleComponent, children, headerRightComponent, childrenMargin } = props;
  const { theme, setTheme } = useTheme();
  const isDark = theme === ThemeName.DARK;

  return (
    <View style={[
      styles.root,
      { backgroundColor: isDark ? '#18181B' : '#fff' }
    ]}>
      {/* Top absolute background bar */}
      <View style={styles.topBg} />

      <View style={[
        styles.content,
        !childrenMargin ? styles.contentNoMargin : styles.contentWithMargin,
      ]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>

      <View style={styles.headerRow}>
        <Image source={LeapLogo} style={styles.logo} />
        {headerRightComponent ? (
          headerRightComponent
        ) : (
          <View style={styles.headerRightActions}>
            <IconButton
              isFilled={true}
              onPress={() => setTheme(isDark ? ThemeName.LIGHT : ThemeName.DARK)}
              image={{
                src: isDark ? Images.Misc.LightTheme : Images.Misc.DarkTheme,
                alt: 'Theme Switch',
              }}
            />
            <Label
              imgSrc={Images.Misc.HelpIcon}
              title={'Visit Help Center'}
              type={'normal'}
              onClick={() => Linking.openURL(HELP_CENTER_URL)}
              isRounded={true}
            />
          </View>
        )}
      </View>

      {titleComponent && (
        <View style={styles.titleBar}>
          {titleComponent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: 20,
  },
  topBg: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    height: 40,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'scroll',
  },
  contentNoMargin: {
    marginTop: 64, // mt-16
  },
  contentWithMargin: {
    marginTop: 32, // mt-8
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  headerRow: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    zIndex: 10,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  titleBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    top: 70, // Below the header row
  },
});
