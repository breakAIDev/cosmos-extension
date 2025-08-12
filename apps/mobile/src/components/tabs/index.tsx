import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabsList: Tab[];
  tabsContent: { [key: string]: React.ReactNode };
  style?: StyleProp<ViewStyle>;
};

export const Tabs: React.FC<TabsProps> = ({ tabsList, tabsContent, style }) => {
  const [activeTab, setActiveTab] = useState(tabsList[0]?.id);

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabsList.map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.tabBtn,
              activeTab === id ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab(id)}
          >
            <Text style={[styles.tabLabel, activeTab === id ? styles.activeLabel : styles.inactiveLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.tabContent}>{React.isValidElement(tabsContent[activeTab]) ? tabsContent[activeTab] : <View/>}</View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#222', // gray-900
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginRight: 4,
  },
  activeTab: {
    borderColor: '#222', // gray-900 or white in dark
  },
  inactiveTab: {
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 16,
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#222', // gray-900 or white in dark
  },
  inactiveLabel: {
    color: '#888', // gray-400
  },
  tabContent: {
    width: '100%',
    marginTop: 12,
  },
});
