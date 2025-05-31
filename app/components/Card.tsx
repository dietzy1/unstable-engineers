import React from 'react';
import { View, Image } from 'react-native';
import { CardInteractions } from './CardInteractions'; // Assuming this component handles touch events
import { MagicCard } from 'types/Card';

export const Card = ({ onPress, onLongPress }: MagicCard) => {
  return (
    <CardInteractions onPress={onPress} onLongPress={onLongPress}>
      {/*
        By using h-full and w-full, the card will now fill whatever container it's placed in.
        This makes the component reusable and fixes sizing issues.
      */}
      <View className="h-full w-full rounded-lg bg-black shadow-lg">
        <Image
          source={require('../assets/card.png')}
          className="h-full w-full rounded-lg" // Also round the image itself
          resizeMode="cover"
        />
      </View>
    </CardInteractions>
  );
};
