import React, { useRef } from 'react';
import ReCaptcha from 'react-native-recaptcha-that-works';

type Props = {
  siteKey: string;
  baseUrl: string; // e.g., 'https://yourdomain.com'
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: any) => void;
};

const Recaptcha: React.FC<Props> = ({ siteKey, baseUrl, onVerify, onExpire, onError }) => {
  const recaptchaRef = useRef<ReCaptcha>(null);

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
      {/* <Button title="I'm not a robot" onPress={show} /> */}
    </>
  );
};

export default Recaptcha;
