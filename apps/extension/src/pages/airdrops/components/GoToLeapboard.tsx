import { RocketLaunch } from '@phosphor-icons/react';
import { captureException } from '@sentry/react';
import classNames from 'classnames';
import Text from 'components/text';
import { ButtonName, ButtonType, EventName } from 'config/analytics';
import { NNWALLETBOARD_URL } from 'config/constants';
import mixpanel from 'mixpanel-browser';
import React from 'react';

interface GoToLeapboardProps {
  className?: string;
}
const redirectURL = `${NNWALLETBOARD_URL}/airdrops`;

export default function GoToLeapboard({ className = '' }: GoToLeapboardProps) {
  const trackCTAEvent = () => {
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.AIRDROPS,
        buttonName: ButtonName.GO_TO_NNWALLETBOARD,
        redirectURL,
        time: Date.now() / 1000,
      });
    } catch (e) {
      captureException(e);
    }
  };

  return (
    <div
      className={classNames(
        'flex gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-3xl w-fit items-center cursor-pointer',
        className,
      )}
      onClick={() => {
        window.open(redirectURL, '_blank');
        trackCTAEvent();
      }}
    >
      <img src='https://assets.leapwallet.io/Leapboard.png' alt='nnwalletboard_logo' width={16} height={16} />
      <Text size='xs' className='font-bold'>
        Go to NNWallet Dashboard
      </Text>
      <RocketLaunch size={16} className='text-black-100 dark:text-white-100' />
    </div>
  );
}
