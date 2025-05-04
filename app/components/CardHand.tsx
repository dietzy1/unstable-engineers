import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CardProps } from './Card';

interface CardHandProps {
  cards: CardProps[];
  maxDisplayCards?: number;
  color?: string;
}

export const CardHand = ({
  cards,
  maxDisplayCards = 5,
  color = '#6D28D9', // Default to purple
}: CardHandProps) => {
  // Filter for action cards
  const actionCards = cards.filter((card) => card.type === 'action');

  // Limit the number of cards shown
  const displayCount = Math.min(actionCards.length, maxDisplayCards);

  // Generate an array of the number of cards to display
  const displayCards = Array.from({ length: displayCount });

  return (
    <View style={styles.container}>
      {displayCards.map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              left: index * 15,
              transform: [{ rotate: `${(index - Math.floor(displayCount / 2)) * 5}deg` }],
              zIndex: index,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  card: {
    position: 'absolute',
    width: 25,
    height: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
});
