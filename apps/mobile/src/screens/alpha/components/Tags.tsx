import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';

type RaffleVisibilityStatus = 'completed' | 'hidden' | undefined;

type TagProps = {
  onPress?: () => void;
  style?: any;
  children: string | React.ReactNode;
};

const Tag = ({ onPress, style, children }: TagProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.tagBase, style]}
  >
    {typeof children === 'string' ?(
      <Text style={styles.tagText}>{children}</Text>
    ) : (
      React.isValidElement(children) ? children : null
    )
    }    
  </TouchableOpacity>
);

type TagsProps = {
  isLive?: boolean;
  visibilityStatus?: RaffleVisibilityStatus;
  ecosystemFilter: string[];
  categoryFilter: string[];
  style?: StyleProp<ViewStyle>;
  handleEcosystemClick?: (ecosystem: string) => void;
  handleCategoryClick?: (category: string) => void;
  handleLiveClick?: () => void;
};

export default function Tags({
  isLive,
  visibilityStatus,
  ecosystemFilter,
  categoryFilter,
  style,
  handleEcosystemClick,
  handleCategoryClick,
  handleLiveClick,
}: TagsProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.wrapRow}>
        {visibilityStatus === 'completed' && (
          <Tag
            style={[styles.completedTag]}
            onPress={() => handleCategoryClick?.('Completed')}
          >
            Completed
          </Tag>
        )}
        {visibilityStatus === 'hidden' && (
          <Tag
            style={[styles.hiddenTag]}
            onPress={() => handleCategoryClick?.('hidden')}
          >
            Hidden
          </Tag>
        )}
        {ecosystemFilter?.filter(Boolean).map((ecosystem) => (
          <Tag key={ecosystem} onPress={() => handleEcosystemClick?.(ecosystem)}>
            {ecosystem}
          </Tag>
        ))}
        {categoryFilter?.filter(Boolean).map((category) => (
          <Tag key={category} onPress={() => handleCategoryClick?.(category)}>
            {category}
          </Tag>
        ))}
      </View>

      {isLive && (
        <Tag style={styles.liveTag} onPress={handleLiveClick}>
          Live
        </Tag>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8, // If your React Native version supports it
    width: '100%',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBase: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#f5f6f7', // Secondary background
    borderColor: '#e2e3e5',     // Secondary border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    marginBottom: 4,
    minWidth: 48,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  completedTag: {
    backgroundColor: '#e6f9e9', // light green
    borderColor: '#a6e3b0',     // accent green
    color: '#22c55e',
  },
  hiddenTag: {
    backgroundColor: '#fbe9e9', // light red/pink
    borderColor: '#ffbdbd',     // accent red
    color: '#f43f5e',
  },
  liveTag: {
    backgroundColor: '#ef4444', // bright red
    borderColor: '#ef4444',
    color: '#fff',
  },
});
