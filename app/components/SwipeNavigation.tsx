import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface SwipeNavigationProps {
  children: React.ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const SwipeNavigation = ({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
}: SwipeNavigationProps) => {
  const pan = useRef(new Animated.ValueXY()).current;

  // The threshold for considering a gesture a swipe
  const SWIPE_THRESHOLD = 120;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        // Determine which swipe occurred based on velocity and distance
        const { dx, dy, vx, vy } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(vx) > 0.3) {
          // Horizontal swipe
          if (dx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (dx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else if (Math.abs(dy) > SWIPE_THRESHOLD && Math.abs(vy) > 0.3) {
          // Vertical swipe
          if (dy > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (dy < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }

        // Reset pan to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
