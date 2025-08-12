import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { EyeIcon } from '../../../../../assets/icons/eye-icon';
import { KeyIcon } from '../../../../../assets/icons/key';
import { LedgerDriveIcon } from '../../../../../assets/icons/ledger-icon';
import { RecoveryPhraseIcon } from '../../../../../assets/icons/recovery-phrase';
import { WalletIcon } from '../../../../../assets/icons/wallet-icon';
import { OnboardingWrapper } from '../../../onboarding/wrapper';
import { useImportWalletContext } from '../import-wallet-context';
import { IconProps } from 'phosphor-react-native';

const ImportTypeButton = ({
  title,
  icon: Icon,
  onPress,
  style,
}: {
  title: string;
  icon: (props: IconProps) => JSX.Element;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) => (
  <TouchableOpacity
    style={[styles.button, style]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <Icon size={24} color="#64748b" /> {/* text-muted-foreground */}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const importMethods = [
  {
    id: 'seed-phrase',
    title: 'Import recovery phrase',
    icon: RecoveryPhraseIcon,
  },
  {
    id: 'private-key',
    title: 'Import private key',
    icon: KeyIcon,
  },
  {
    id: 'ledger',
    title: 'Connect via Ledger',
    icon: LedgerDriveIcon,
  },
  {
    id: 'watch-wallet',
    title: 'Watch address',
    icon: EyeIcon,
  },
];

export const SelectImportType = () => {
  const { prevStep, currentStep, setCurrentStep, setWalletName } = useImportWalletContext();

  return (
    <OnboardingWrapper
      headerIcon={<WalletIcon size={24} />}
      heading="Use an existing wallet"
      subHeading={`Select how you'd like to access your existing wallet`}
      style={styles.gap10}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <View style={styles.flexColGap4}>
        {importMethods.map((method) => (
          <ImportTypeButton
            key={method.id}
            onPress={() => {
              setWalletName(method.id);
              setCurrentStep(currentStep + 1);
            }}
            icon={method.icon}
            title={method.title}
          />
        ))}
      </View>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  gap10: {
    gap: 40,
  },
  flexColGap4: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#F1F5F9', // bg-secondary-200
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    width: '100%',
    marginBottom: 0,
    marginTop: 0,
    marginRight: 0,
    marginLeft: 0,
    // shadow/active state or highlight can be added as needed
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
    marginLeft: 16, // gap-4
    color: '#334155',
  },
});
