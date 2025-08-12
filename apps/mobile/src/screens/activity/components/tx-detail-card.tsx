import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ActivityType } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useActivityImage } from '../../../hooks/activity/useActivityImage';

type DetailsCardProps = {
  title: string;
  imgSrc: string | React.ReactNode;
  subtitle: string;
  trailing?: React.ReactNode;
  txType?: ActivityType;
  activeChain: SupportedChain;
  style?: any;
};

export const DetailsCard: React.FC<DetailsCardProps> = ({
  title,
  imgSrc,
  subtitle,
  trailing,
  txType,
  activeChain,
  style,
}) => {
  const defaultImg = useActivityImage(txType ?? 'fallback', activeChain);
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={[styles.container, style]}>
      {typeof imgSrc === 'string' ? (
        <Image
          source={imageError ? { uri: defaultImg } : { uri: imgSrc }}
          onError={() => setImageError(true)}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        React.isValidElement(imgSrc) ? imgSrc : null
      )}

      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {trailing ? (
        <View style={styles.trailing}>
          {typeof trailing === 'string' ? (
            <Text style={styles.trailingText}>{trailing}</Text>
          ) : (
            React.isValidElement(trailing) ? trailing : null
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7F8FA', // secondary-100
    borderRadius: 16,
    width: '100%',
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  textCol: {
    flex: 1,
    flexDirection: 'column',
    // gap: 2,    // REMOVE THIS!
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A94A6', // muted-foreground
    marginBottom: 2,  // Simulate gap
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  trailing: {
    marginLeft: 12,   // Give some space from the content
    justifyContent: 'center',
  },
  trailingText: {
    color: '#8A94A6',
    fontSize: 14,
  },
});
