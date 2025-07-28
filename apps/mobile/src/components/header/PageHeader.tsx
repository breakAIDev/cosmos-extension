import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';

import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import { LineDivider } from '@leapwallet/leap-ui';

import { useDefaultTokenLogo } from '../../hooks';
import useNewChainTooltip from '../../hooks/useNewChainTooltip';
import AddFromChainStore from '../../screens/home/AddFromChainStore';
import { PageHeaderProps } from '../../types/components';
import { imgOnError } from '../../utils/imgOnError';
import { Images } from '../../../assets/images';

export const PageHeader: React.FC<PageHeaderProps> = React.memo(
  ({
    title,
    titleIcon,
    action,
    imgSrc,
    onImgClick,
    dontShowFilledArrowIcon = false,
    dontShowBottomDivider = false,
  }) => {
    const { showToolTip: _showToolTip, toolTipData, handleToolTipClose } = useNewChainTooltip();
    const defaultTokenLogo = useDefaultTokenLogo();
    const [newChain, setNewChain] = useState<string | null>(null);
    const customChains = useCustomChains();

    const showToolTip = _showToolTip && !!toolTipData && !!onImgClick;

    return (
      <>
        {showToolTip && (
          <Pressable
            onPress={handleToolTipClose}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.headerContainer}>
          {/* Title & Icon */}
          <View style={styles.centeredRow}>
            <Text style={styles.titleText}>{title}</Text>
            {titleIcon}
          </View>

          {/* Left Action Button */}
          {action && (
            <View style={styles.leftAction}>
              <action.Component {...action.props} />
            </View>
          )}

          {/* Right Image/Icon */}
          {imgSrc && (
            <View style={styles.rightIconContainer}>
              <TouchableOpacity
                style={onImgClick ? styles.imgButton : styles.fullHeight}
                onPress={onImgClick}
                disabled={!onImgClick}
              >
                {typeof imgSrc === 'string' ? (
                  <Image
                    source={{ uri: imgSrc }}
                    onError={imgOnError(defaultTokenLogo)}
                    style={onImgClick ? styles.imgSmall : styles.imgLarge}
                    resizeMode="contain"
                  />
                ) : (
                  imgSrc
                )}
                {onImgClick && !dontShowFilledArrowIcon && (
                  <Image
                    source={Images.Misc.FilledArrowDown}
                    style={styles.arrowIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Divider */}
          {!dontShowBottomDivider && (
            <View style={styles.bottomDivider}>
              <LineDivider />
            </View>
          )}
        </View>

        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => setNewChain(null)}
          newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
        />
      </>
    );
  }
);

PageHeader.displayName = 'PageHeader';

const styles = StyleSheet.create({
  headerContainer: {
    height: 72,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  centeredRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000', // Adjust for dark mode if needed
    marginRight: 8,
  },
  leftAction: {
    position: 'absolute',
    top: 0,
    left: 16,
    height: '100%',
    justifyContent: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    top: 0,
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  imgButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imgLarge: {
    height: 28,
    width: 28,
  },
  imgSmall: {
    height: 20,
    width: 20,
  },
  fullHeight: {
    height: '100%',
    justifyContent: 'center',
  },
  arrowIcon: {
    width: 16,
    height: 6,
    marginLeft: 6,
  },
  bottomDivider: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
