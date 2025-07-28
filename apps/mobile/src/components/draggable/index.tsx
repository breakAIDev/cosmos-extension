import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { View } from 'react-native';

interface DraggableContainerProps<T> {
  data: T[];
  renderItem: (params: {
    item: T;
    index: number;
    drag: () => void;
    isActive: boolean;
  }) => React.ReactElement;
  onDragEnd: (data: T[]) => void;
  keyExtractor: (item: T, index: number) => string;
  style?: object;
}

function DraggableContainer<T>({
  data,
  renderItem,
  onDragEnd,
  keyExtractor,
  style,
}: DraggableContainerProps<T>) {
  return (
    <View style={style}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onDragEnd={({ data }) => onDragEnd(data)}
      />
    </View>
  );
}

export default DraggableContainer;
