import React from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { MagicCard } from 'types/Card';
import { Card } from './Card';
import { LinearGradient } from 'expo-linear-gradient';

interface CardHandProps {
  cards: MagicCard[];
}

export const CardHand = ({ cards }: CardHandProps) => {
  if (!cards || cards.length === 0) return null;

  const cardWidth = 100;
  const cardHeight = 140;

  const handContainerHeight = Dimensions.get('window').height * 0.25;

  return (
    <View
      className="absolute bottom-0 w-full"
      style={{
        height: handContainerHeight,
        paddingBottom: 80,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Dimensions.get('window').width / 2 - cardWidth / 2,
          alignItems: 'flex-end', // This aligns the bottom of the card wrappers.
          height: '100%',
        }}
        snapToInterval={cardWidth - 50}
        decelerationRate="fast">
        {cards.map((card, idx) => {
          const middleIndex = (cards.length - 1) / 2;
          const distanceFromMiddle = Math.abs(idx - middleIndex);

          const rotation = (idx - middleIndex) * 4;
          const translateY = distanceFromMiddle * -6;

          return (
            <View
              key={card.id}
              style={{
                width: cardWidth,
                height: cardHeight, // Use the defined card height
                marginRight: -60, // Increase the overlap for a tighter hand
                transform: [{ rotateZ: `${rotation}deg` }, { translateY }],
              }}>
              <Card {...card} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
