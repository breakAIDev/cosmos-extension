import React from 'react';
import { View } from 'react-native';
import { RaffleAndTestnetAlertStrip } from '../../../components/alert-strip';
import { ApiStatusWarningStrip } from '../../../components/alert-strip/ApiStatusWarningStrip';
import { AlertStrip } from '../../../components/alert-strip/v2';
import { useQueryParams } from '../../../hooks/useQuery';
import { queryParams } from '../../../utils/query-params';

export const GeneralHomeAlertStrips = ({ balanceError }: { balanceError: boolean }) => {
  const query = useQueryParams();

  const txDeclined = query.get(queryParams.txDeclined);
  const walletAvatarChanged = query.get(queryParams.walletAvatarChanged);
  const faucetError = query.get(queryParams.faucetError);
  const faucetSuccess = query.get(queryParams.faucetSuccess);

  return (
    <View>
      <RaffleAndTestnetAlertStrip />

      {balanceError && <ApiStatusWarningStrip />}

      {txDeclined ? (
        <AlertStrip
          type="error"
          timeOut={4000}
          onHide={() => query.remove(queryParams.txDeclined)}
        >
          Transaction declined
        </AlertStrip>
      ) : null}

      {(faucetSuccess || faucetError) ? (
        <AlertStrip
          timeOut={6000}
          type={faucetSuccess ? 'success' : 'error'}
          onHide={() => {
            query.remove([queryParams.faucetSuccess, queryParams.faucetError]);
          }}
        >
          {faucetSuccess || faucetError}
        </AlertStrip>
      ) : null}

      {walletAvatarChanged ? (
        <AlertStrip
          timeOut={2500}
          type="success"
          onHide={() => query.remove(queryParams.walletAvatarChanged)}
        >
          Profile picture changed successfully
        </AlertStrip>
      ) : null}
    </View>
  );
};
