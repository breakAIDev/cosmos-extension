import { Tag } from 'phosphor-react-native';
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type NoCollectionCardProps = {
  title: string;
  subTitle?: ReactNode;
};

export function NoCollectionCard({ title, subTitle }: NoCollectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Tag size={24} color="#a1a1aa" /> {/* text-gray-200 */}
      </View>
      <Text style={styles.title}>{title}</Text>
      {typeof subTitle === 'string' ? <Text style={styles.subTitle}>{subTitle}</Text>
      : React.isValidElement(subTitle) ? subTitle : <View/>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    textAlign: 'center',
  },
  iconCircle: {
    borderRadius: 99,
    backgroundColor: '#f9fafb', // bg-gray-50
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#18181b', // text-gray-800
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  subTitle: {
    color: '#9ca3af', // text-gray-400
    fontWeight: '500',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
