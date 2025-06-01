import React, { useState } from 'react';
import { View, Image, Modal, Pressable, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MagicCard } from 'types/Card';
import { CardInteractions } from './CardInteractions';
import { useDrag } from 'screens/game/overview/DragContext';

export const Card = ({
  card,
  onPlayCard,
}: {
  card: MagicCard;
  onPlayCard: (cardId: string) => void;
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const { draggingCardId, setDraggingCardId, dragPosition, setDragPosition, centerLayout } =
    useDrag();

  const gesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      console.log('Drag begin for card:', card.id);
      offset.value = { x: 0, y: 0 };
      scale.value = withSpring(1.2);
      zIndex.value = 100;
      runOnJS(setDraggingCardId)(card.id);
      runOnJS(setDragPosition)({ x: 0, y: 0 });
    })
    .onUpdate((e) => {
      'worklet';
      offset.value = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(setDragPosition)({ x: e.absoluteX, y: e.absoluteY });
    })
    .onEnd(() => {
      'worklet';
      console.log('Drag end for card:', card.id);
      console.log('Final drag position:', dragPosition);
      console.log('Center layout:', centerLayout);

      let droppedOnBoard = false;
      if (centerLayout && dragPosition) {
        const { x, y, width, height } = centerLayout;
        droppedOnBoard =
          dragPosition.x >= x &&
          dragPosition.x <= x + width &&
          dragPosition.y >= y &&
          dragPosition.y <= y + height;

        console.log('Dropped on board:', droppedOnBoard);
        if (droppedOnBoard) {
          runOnJS(onPlayCard)(card.id);
        }
      }

      offset.value = withSpring({ x: 0, y: 0 });
      scale.value = withSpring(1);
      zIndex.value = 0;
      runOnJS(setDraggingCardId)(null);
      runOnJS(setDragPosition)(null);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[animatedStyle, { position: 'relative' }]}>
          <CardInteractions onLongPress={() => setModalVisible(true)}>
            <View className="h-full w-full rounded-lg bg-black shadow-lg">
              <Image
                source={require('../assets/card.png')}
                className="h-full w-full rounded-lg"
                resizeMode="cover"
              />
            </View>
          </CardInteractions>
        </Animated.View>
      </GestureDetector>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/80"
          onPress={() => setModalVisible(false)}>
          <View className="h-3/5 w-4/5">
            <Image
              source={require('../assets/card.png')}
              className="h-full w-full rounded-lg"
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
