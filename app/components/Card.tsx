import React from 'react';
import { View, Image } from 'react-native';

import { CardInteractions } from './CardInteractions';
import { MagicCard } from 'types/Card';

export const Card = ({ onPress, onLongPress }: MagicCard) => {
  return (
    <CardInteractions onPress={onPress} onLongPress={onLongPress}>
      <View className=" h-48 w-32  rounded-lg shadow-lg">
        <Image
          source={require('../assets/card.png')}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
    </CardInteractions>
  );
};
