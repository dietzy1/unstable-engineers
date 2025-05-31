import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MagicCard } from 'types/Card';

import { Card } from './Card';

interface CardHandProps {
  cards: MagicCard[];
}

export const CardHand = ({ cards }: CardHandProps) => {
  if (!cards || cards.length === 0) return null;

  // 25% of the screen height
  const handHeight = Dimensions.get('window').height * 0.2;

  return (
    <View
      className="w-full rounded-t-2xl border-t border-gray-700  px-2  pt-2 shadow-2xl"
      style={{ height: handHeight }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 12, height: '100%' }}>
        {cards.map((card, idx) => (
          <View
            key={card.id}
            className="mx-2"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}>
            <Card {...card} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
