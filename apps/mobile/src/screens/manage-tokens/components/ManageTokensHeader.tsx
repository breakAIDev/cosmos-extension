import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import Text from '../../../components/text';
import { PageHeader } from '../../../components/header/PageHeaderV2';

const ManageTokensHeader = ({ title, onBack }: { title?: string; onBack?: () => void }) => {
  const navigation = useNavigation();

  return (
    <PageHeader style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          if (onBack) onBack();
          else navigation.goBack();
        }}
        style={styles.iconWrapper}
      >
        <ArrowLeft size={28} color="#64748b" />
      </TouchableOpacity>
      <Text style={styles.title} color="text-monochrome">
        {title ?? 'Manage tokens'}
      </Text>
      {/* Spacer to balance flex layout */}
      <View style={styles.iconWrapper} />
    </PageHeader>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8fafc', // secondary-50
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // secondary-300
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 56,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    flex: 1,
    textAlign: 'center',
  },
});

export default ManageTokensHeader;
