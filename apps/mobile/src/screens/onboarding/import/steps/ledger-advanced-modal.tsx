import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import BottomModal from '../../../../components/new-bottom-modal';
import Text from '../../../../components/text';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Colors } from '../../../../theme/colors';

function removeLeadingZero(input: string) {
  return Number(input).toString();
}

interface LedgerAdvancedModeProps {
  isAdvanceModeEnabled: boolean;
  setIsAdvanceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  getCustomLedgerAccountDetails: (
    useEvmApp: boolean,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>;
  existingAddresses: string[] | undefined;
  setSelectedIds: (val: { [id: number]: boolean }) => void;
  selectedIds: { [id: string]: boolean };
}

export const LedgerAdvancedMode = ({
  isAdvanceModeEnabled,
  setIsAdvanceModeEnabled,
  getCustomLedgerAccountDetails,
  existingAddresses,
  setSelectedIds,
  selectedIds,
}: LedgerAdvancedModeProps) => {
  const [walletName, setWalletName] = useState('');
  const [derivationInput, setDerivationInput] = useState({
    index1: '0',
    index2: '0',
    index3: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    walletName?: string;
    derivationInput?: string;
    addError?: string;
  }>({});
  const { theme } = useTheme();

  const isDisabled = useMemo(() => {
    return (
      !walletName ||
      Object.values(derivationInput).filter((value) => value === '0').length === 3 ||
      Object.values(derivationInput).some((value) => value === undefined || value === '') ||
      !!errors.derivationInput ||
      isLoading
    );
  }, [derivationInput, errors, walletName, isLoading]);

  const handleDerivationInputChange = (name: string, value: string) => {
    if (name === 'index2' && (parseInt(value) !== 0 && parseInt(value) !== 1)) return;
    setDerivationInput({ ...derivationInput, [name]: removeLeadingZero(value) });
  };

  const clearFields = () => {
    setErrors({});
    setWalletName('');
    setDerivationInput({ index1: '0', index2: '0', index3: '0' });
  };

  useEffect(() => {
    if (!isAdvanceModeEnabled) clearFields();
  }, [isAdvanceModeEnabled]);

  useEffect(() => {
    if (Object.values(derivationInput).every((value) => !value || parseInt(value) >= 0)) {
      setErrors((prevValue) => ({ ...prevValue, derivationInput: undefined }));
      return;
    }
    setErrors((prevValue) => ({
      ...prevValue,
      derivationInput: 'Kindly enter a valid derivation path',
    }));
  }, [derivationInput]);

  const onAdd = async () => {
    try {
      setIsLoading(true);
      if (!walletName) {
        setErrors((prevValue) => ({
          ...prevValue,
          walletName: 'Kindly enter wallet name to continue',
        }));
        setIsLoading(false);
        return;
      }
      if (parseInt(derivationInput.index1) > 100 || parseInt(derivationInput.index3) > 100) {
        setErrors((prevValue) => ({
          ...prevValue,
          derivationInput: 'Please enter a value between 0 - 100 for Account and Address index fields',
        }));
        setIsLoading(false);
        return;
      }
      const input = `${derivationInput.index1}'/${derivationInput.index2}/${derivationInput.index3}`;
      await getCustomLedgerAccountDetails(false, input, walletName, existingAddresses);
      const hdPath = `m/44'/118'/${input}`;
      setSelectedIds({ ...selectedIds, [hdPath]: true });
      setIsLoading(false);
      clearFields();
      setIsAdvanceModeEnabled(false);
    } catch (error) {
      setIsLoading(false);
      setErrors((prevValue) => ({
        ...prevValue,
        addError: ((error as Error)?.message ?? 'Path does not seem to be valid'),
      }));
    }
  };

  return (
    <BottomModal
      isOpen={isAdvanceModeEnabled}
      onClose={() => setIsAdvanceModeEnabled(false)}
      title="Advanced mode"
    >
      <Text style={styles.label} size="md">
        Wallet name
      </Text>
      <Input
        autoComplete="off"
        placeholder="Enter wallet name"
        value={walletName}
        onChangeText={val => {
          setErrors((prev) => ({ ...prev, walletName: undefined }));
          setWalletName(val);
        }}
        status={errors?.walletName ? 'error' : undefined}
        style={[
          styles.input,
          errors?.walletName ? styles.inputError : styles.inputDefault,
          { marginBottom: errors?.walletName ? 6 : 20 },
        ]}
      />
      {!!errors?.walletName && (
        <Text style={styles.errorText} size="sm">
          {errors?.walletName}
        </Text>
      )}
      <Text style={styles.label} size="md">
        Custom derivation path
      </Text>

      <View style={styles.derivationRow}>
        <Text style={styles.derivationText} size="sm">m/44'/...'</Text>
        <Input
          placeholder="0"
          value={derivationInput.index1}
          onChangeText={val => handleDerivationInputChange('index1', val)}
          status={errors?.derivationInput ? 'error' : undefined}
          keyboardType="numeric"
          style={[
            styles.derivationInput,
            errors?.derivationInput ? styles.inputError : styles.inputDefault,
          ]}
        />
        <Text style={styles.derivationText} size="sm">{`'/`}</Text>
        <Input
          placeholder="0"
          value={derivationInput.index2}
          onChangeText={val => handleDerivationInputChange('index2', val)}
          editable={false}
          style={[styles.derivationInput, styles.inputDisabled]}
        />
        <Text style={styles.derivationText} size="sm">/</Text>
        <Input
          placeholder="0"
          value={derivationInput.index3}
          onChangeText={val => handleDerivationInputChange('index3', val)}
          status={errors?.derivationInput ? 'error' : undefined}
          keyboardType="numeric"
          style={[
            styles.derivationInput,
            errors?.derivationInput ? styles.inputError : styles.inputDefault,
          ]}
        />
      </View>
      {(!!errors?.derivationInput || !!errors?.addError) && (
        <Text style={styles.errorText} size="sm">
          {errors?.derivationInput ?? errors?.addError}
        </Text>
      )}

      <Button
        style={[
          {backgroundColor: theme === ThemeName.DARK ? Colors.white100 : 'black'},
          styles.confirmButton,
          isDisabled ? { opacity: 0.5 } : null,
          (!!errors?.derivationInput || !!errors?.addError)
            ? { marginTop: 16 }
            : { marginTop: 32 },
        ]}
        onPress={onAdd}
        disabled={isDisabled}
      >
        {isLoading ? (
          <LoaderAnimation color={Colors.white100} style={styles.loader} />
        ) : (
          <>Confirm and proceed</>
        )}
      </Button>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 58,
    fontSize: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 0,
  },
  inputDefault: {
    borderColor: '#27272a',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF5A5F',
    backgroundColor: '#fff0f0',
  },
  inputDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#f1f1f1',
    opacity: 0.5,
  },
  errorText: {
    color: '#FF5A5F',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 2,
  },
  derivationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
  },
  derivationText: {
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginHorizontal: 2,
  },
  derivationInput: {
    width: 82,
    textAlign: 'center',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 2,
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loader: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },
});
