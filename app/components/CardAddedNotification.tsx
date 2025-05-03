import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CardAddedNotificationProps {
  visible: boolean;
  cardName: string;
  type: 'mana' | 'action';
  onHide: () => void;
}

export const CardAddedNotification = ({
  visible,
  cardName,
  type,
  onHide,
}: CardAddedNotificationProps) => {
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // Show the notification
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getBgColor = () => {
    return type === 'mana' ? 'bg-blue-600' : 'bg-red-600';
  };

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      className={`${getBgColor()} items-center rounded-lg px-4 py-2`}>
      <Text className="font-bold text-white">Card Added</Text>
      <Text className="text-sm text-white">{cardName}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
