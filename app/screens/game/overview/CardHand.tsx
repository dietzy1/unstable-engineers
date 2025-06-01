import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { MagicCard } from 'types/Card';

import { useDrag } from './DragContext';
import { Card } from '../../../components/Card';

interface CardHandProps {
  cards: MagicCard[];
  onPlayCard: (cardId: string) => void;
}

export const CardHand = ({ cards, onPlayCard }: CardHandProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { draggingCardId } = useDrag();

  const cardWidth = 100;
  const cardHeight = 140;
  const cardOverlap = -50;

  useEffect(() => {
    if (scrollViewRef.current && cards.length > 0) {
      const cardVisibleWidth = cardWidth + cardOverlap;
      const middleCardIndex = (cards.length - 1) / 2;
      const targetScrollX = middleCardIndex * cardVisibleWidth;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: targetScrollX,
          animated: true,
        });
      }, 100);
    }
  }, [cards.length]);

  if (!cards || cards.length === 0) return null;

  return (
    <View
      className="absolute bottom-0 z-20 w-full"
      style={{
        height: 600,
        paddingBottom: 80,
      }}>
      <ScrollView
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
                zIndex: draggingCardId === card.id ? 100 : 1,
              }}>
              <Card card={card} onPlayCard={onPlayCard} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
