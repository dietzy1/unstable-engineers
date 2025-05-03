import React, { useState } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface CardInteractionsProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const CardInteractions = ({ children, onPress, onLongPress }: CardInteractionsProps) => {
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(1.1);
    setPressed(true);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    setPressed(false);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  pressed: {
    elevation: 5,
    shadowOpacity: 0.5,
  },
});
