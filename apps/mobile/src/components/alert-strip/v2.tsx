import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const alertStripV2Config = {
  info: {
    backgroundColor: '#2262c6',
    textColor: '#fff',
    icon: { name: 'info', color: '#fff' }
  },
  warning: {
    backgroundColor: '#f9be18',
    textColor: '#18181b',
    icon: { name: 'alert-triangle', color: '#18181b' }
  },
  error: {
    backgroundColor: '#ef4444',
    textColor: '#fff',
    icon: { name: 'x-circle', color: '#fff' }
  },
  success: {
    backgroundColor: '#0eb25d',
    textColor: '#fff',
    icon: { name: 'check-circle', color: '#fff' }
  },
} as const;

type AlertType = keyof typeof alertStripV2Config;

type AlertStripProps = {
  type?: AlertType;
  style?: StyleProp<ViewStyle>;
  timeOut?: number;
  onHide?: VoidFunction;
  children: React.ReactNode;
};

export const AlertStrip: React.FC<AlertStripProps> = ({
  type = 'info',
  style,
  timeOut,
  onHide,
  children,
}) => {
  const config = alertStripV2Config[type];
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (timeOut) {
      const timeout = setTimeout(() => {
        setShow(false);
        onHide?.();
      }, timeOut);
      return () => clearTimeout(timeout);
    }
  }, [timeOut, onHide]);

  if (!show) return null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      style,
    ]}>
      <Icon
        name={config.icon.name}
        size={16}
        color={config.icon.color}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: config.textColor }]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1,
  },
});
