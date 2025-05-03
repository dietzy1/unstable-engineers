import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

interface LandscapeContainerProps {
  children: React.ReactNode;
}

export const LandscapeContainer = ({ children }: LandscapeContainerProps) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;

  if (!isLandscape) {
    // If not in landscape, apply a transformation to make it look landscape
    return (
      <View
        style={[
          styles.container,
          {
            transform: [{ rotate: '90deg' }],
            width: dimensions.height,
            height: dimensions.width,
          },
        ]}>
        {children}
      </View>
    );
  }

  // Already in landscape, no transformation needed
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
