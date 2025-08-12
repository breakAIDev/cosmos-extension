import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk';
import { type IconProps } from 'phosphor-react-native';
import { MotiView } from 'moti'; // Use Moti for animation
import { LEDGER_NETWORK } from '../onboarding/import/import-wallet-context';

export const HoldState = ({
  Icon,
  title,
  moveToNextApp,
  appType,
  getLedgerAccountDetails,
}: {
  Icon: (props: IconProps) => React.JSX.Element;
  title: string
  ;
  moveToNextApp: (
    pathWiseAddresses: Record<
      string,
      Record<
        string,
        {
          address: string;
          pubKey: Uint8Array;
        }
      >
    >,
  ) => void;
  appType: LEDGER_NETWORK;
  getLedgerAccountDetails: (app: LEDGER_NETWORK) => Promise<
    Record<
      string,
      Record<
        string,
        {
          address: string;
          pubKey: Uint8Array;
        }
      >
    >
  >;
}) => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const unlocked = await isLedgerUnlocked(appType === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos');
        if (unlocked) {
          const pathWiseAddresses = await getLedgerAccountDetails(appType);
          moveToNextApp(pathWiseAddresses);
          clearInterval(interval);
        }
      } catch (error) {
        // Just for debugging
        console.error(error);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [appType, getLedgerAccountDetails, moveToNextApp]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        {/* Three layered animated circles */}
        <MotiView
          from={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 1200,
            repeatReverse: true,
          }}
          style={styles.circleLarge}
        >
          <MotiView
            from={{ scale: 1.075 }}
            animate={{ scale: 1 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 1200,
              repeatReverse: true,
            }}
            style={styles.circleMedium}
          >
            <MotiView
              from={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 1200,
                repeatReverse: true,
              }}
              style={styles.circleSmall}
            >
              <Icon size={24} color="#fff" />
            </MotiView>
          </MotiView>
        </MotiView>

        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
  },
  circleLarge: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: 'rgba(16,185,129,0.16)', // bg-accent-foreground/20
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleMedium: {
    width: 89,
    height: 89,
    borderRadius: 44.5,
    backgroundColor: 'rgba(16,185,129,0.32)', // bg-accent-foreground/40
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSmall: {
    width: 44.5,
    height: 44.5,
    borderRadius: 22.25,
    backgroundColor: '#10b981', // bg-accent-foreground
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
