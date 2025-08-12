import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk';
import { Button } from '../../../../components/ui/button';
import { useImportWalletContext } from '../import-wallet-context';
import { LEDGER_NETWORK } from '../import-wallet-context';
import { MotiView } from 'moti';
import { IconProps } from 'phosphor-react-native';

export const HoldState = ({
  Icon,
  title,
  cta,
  moveToNextApp,
  appType,
}: {
  Icon: (props: IconProps) => React.JSX.Element;
  title: string | React.ReactNode;
  cta?: React.ReactNode;
  moveToNextApp: (appType: LEDGER_NETWORK) => void;
  appType: LEDGER_NETWORK;
}) => {
  const { getLedgerAccountDetails } = useImportWalletContext();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const unlocked = await isLedgerUnlocked(appType === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos');
        if (unlocked) {
          await getLedgerAccountDetails(appType);
          moveToNextApp(appType);
          clearInterval(interval);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [appType, getLedgerAccountDetails, moveToNextApp]);

  return (
    <MotiView
      style={styles.wrapper}
      from={{ opacity: 0, translateX: 70 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -70 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <View style={styles.header}>
        {/* Outer circle */}
        <MotiView
          from={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 1200,
            repeatReverse: true,
          }}
          style={styles.outerCircle}
        >
          {/* Middle circle */}
          <MotiView
            from={{ scale: 1.075 }}
            animate={{ scale: 1 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 900,
              repeatReverse: true,
              delay: 100,
            }}
            style={styles.middleCircle}
          >
            {/* Inner circle */}
            <MotiView
              from={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 700,
                repeatReverse: true,
                delay: 200,
              }}
              style={styles.innerCircle}
            >
              <Icon size={26} color="#343a40" />
            </MotiView>
          </MotiView>
        </MotiView>
        {React.isValidElement(title) ? title
        : typeof title === 'string' ?
          <Text style={styles.title}>{title}</Text>
          : null
        }
      </View>

      {Boolean(cta && moveToNextApp) && (
        <Button style={styles.button} onPress={() => moveToNextApp(appType)}>
          {cta}
        </Button>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 20,
    marginTop: 18,
  },
  outerCircle: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: 'rgba(50,130,250,0.08)', // accent-foreground/20
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: 89,
    height: 89,
    borderRadius: 44.5,
    backgroundColor: 'rgba(50,130,250,0.16)', // accent-foreground/40
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 44.5,
    height: 44.5,
    borderRadius: 22.25,
    backgroundColor: '#3282fa', // accent-foreground
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 36,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    alignSelf: 'flex-end',
    marginTop: 16,
  },
});
