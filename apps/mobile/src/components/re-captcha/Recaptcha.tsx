import React, { useRef } from 'react';
import ReCaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { Button } from '../ui/button';
import Text from '../text';

type Props = {
  ref: RecaptchaRef;
  siteKey: string;
  baseUrl: string; // e.g., 'https://yourdomain.com'
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: any) => void;
};

const Recaptcha: React.FC<Props> = ({ ref, siteKey, baseUrl, onVerify, onExpire, onError }) => {
  const recaptchaRef = useRef<RecaptchaRef>(ref);

  const show = () => {
    recaptchaRef.current?.open();
  };

  return (
    <>
      <ReCaptcha
        ref={recaptchaRef}
        siteKey={siteKey}
        baseUrl={baseUrl}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
        size="normal" // or "invisible"
        theme="light" // or "dark"
      />
      {/* Button to manually trigger if invisible */}
      <Button onPress={show}>
        <Text>I'm not a robot</Text>
      </Button>
    </>
  );
};

export default Recaptcha;
