import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { PageHeader } from '../../../components/header/PageHeaderV2';
import Text from '../../../components/text';
import { useNavigation } from '@react-navigation/native';

type GovHeaderProps = {
  title?: string;
  onBack?: () => void;
};

const GovHeader: React.FC<GovHeaderProps> = ({ title, onBack }) => {
  const navigation = useNavigation();

  return (
    <PageHeader style={styles.header}>
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => {
          if (onBack) {
            onBack();
          } else {
            navigation.goBack();
          }
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft size={28} color="#888" weight="bold" />
      </TouchableOpacity>
      <Text style={styles.title} color="text-monochrome">
        {title ?? 'Governance'}
      </Text>
      {/* Empty space for right-aligned symmetry */}
      <View style={styles.iconWrapper} />
    </PageHeader>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
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
    textAlign: 'center',
    flex: 1,
  },
});

export default GovHeader;
