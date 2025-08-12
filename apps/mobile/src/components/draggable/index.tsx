// src/components/draggable/index.tsx (React Native version)
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  DragEndParams,
} from 'react-native-draggable-flatlist';

interface PropTypes<T> {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onDragEnd?: (params: DragEndParams<T>) => void;
  style?: StyleProp<ViewStyle>;
}

function DraggableContainer<T>(props: PropTypes<T>) {
  return (
    <DraggableFlatList
      data={props.data}
      renderItem={props.renderItem}
      keyExtractor={props.keyExtractor}
      onDragEnd={props.onDragEnd}
      style={props.style}
    />
  );
}

export default DraggableContainer;
