import React from 'react';
import { View, useWindowDimensions } from 'react-native';

interface LandscapeContainerProps {
  children: React.ReactNode;
  forceRotate?: boolean; // Optional prop to force rotation even in landscape
}

export const LandscapeContainer = ({ children, forceRotate = false }: LandscapeContainerProps) => {
  // useWindowDimensions automatically updates on dimension changes
  const { width, height } = useWindowDimensions();

  // Check if the device is in landscape mode
  const isLandscape = width > height;

  // If already in landscape mode and not forcing rotation, render normally
  if (isLandscape && !forceRotate) {
    return <View className="flex-1">{children}</View>;
  }

  // If in portrait mode or force rotating, apply rotation transform
  return (
    <View
      className="flex-1"
      style={{
        transform: [{ rotate: '90deg' }],
        width: height,
        height: width,
      }}>
      {children}
    </View>
  );
};
