import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Text from '../text';

type AlertStripProps = {
  message: React.ReactNode;
  bgColor?: string;
  alwaysShow?: boolean;
  onHide?: VoidFunction;
  style?: any;
  timeOut?: number;
  textStyle?: any;
  onPress?: VoidFunction;
  showCloseButton?: boolean;
  onClose?: VoidFunction;
};

export const AlertStrip: React.FC<AlertStripProps> = ({
  message,
  bgColor,
  alwaysShow = false,
  onHide,
  style,
  onPress,
  timeOut = 8000,
  textStyle,
  showCloseButton = false,
  onClose,
}) => {
  const [show, setShow] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    let timeout: any;
    if (show && !alwaysShow) {
      timeout = setTimeout(() => {
        if (mountedRef.current) {
          setShow(false);
          onHide && onHide();
        }
      }, timeOut);
    }
    return () => {
      mountedRef.current = false;
      timeout && clearTimeout(timeout);
    };
  }, [show, alwaysShow, onHide, timeOut]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bgColor }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text size="sm" style={[styles.text, textStyle]}>
        {message}
      </Text>
      {showCloseButton && (
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          X
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#18181b',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -8,
  },
});
