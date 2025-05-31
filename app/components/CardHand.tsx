import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { MagicCard } from 'types/Card';
import { Card } from './Card';

interface CardHandProps {
  cards: MagicCard[];
}

export const CardHand = ({ cards }: CardHandProps) => {
  // 1. Create a ref for the ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // --- Configuration ---
  const cardWidth = 100;
  const cardHeight = 140;
  const cardOverlap = -50; // The negative margin for overlap
  const handContainerHeight = Dimensions.get('window').height * 0.3;

  // 2. Use useEffect to scroll after the component mounts/updates
  useEffect(() => {
    if (scrollViewRef.current && cards.length > 0) {
      // Calculate the position of the middle card
      const cardVisibleWidth = cardWidth + cardOverlap; // e.g., 100 + (-60) = 40
      const middleCardIndex = (cards.length - 1) / 2;
      const targetScrollX = middleCardIndex * cardVisibleWidth;

      // Use a timeout to ensure layout has finished, especially on Android
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: targetScrollX,
          animated: true,
        });
      }, 100);
    }
    // Rerun this effect if the number of cards changes
  }, [cards.length]);

  if (!cards || cards.length === 0) return null;

  return (
    <View
      className="absolute bottom-0 w-full"
      style={{
        height: handContainerHeight,
        paddingBottom: 80,
      }}>
      <ScrollView
        // 3. Attach the ref to the ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Dimensions.get('window').width / 2 - cardWidth / 2,
          alignItems: 'flex-end',
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
                height: cardHeight,
                marginRight: cardOverlap,
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
