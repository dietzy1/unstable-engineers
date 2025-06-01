import React, { useRef } from 'react';
import { View, Text, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { MagicCard } from 'types/Card';

interface GameBoardProps {
  highlight: boolean;
  setCenterLayout: (layout: { x: number; y: number; width: number; height: number }) => void;
  gameCards: MagicCard[];
  highlightStyle?: any;
}

const GameBoard = ({ highlight, setCenterLayout, gameCards, highlightStyle }: GameBoardProps) => {
  const boardRef = useRef<View>(null);

  const measureBoard = () => {
    if (boardRef.current) {
      boardRef.current.measureInWindow((x, y, width, height) => {
        console.log('GameBoard absolute position:', { x, y, width, height });
        setCenterLayout({ x, y, width, height });
      });
    }
  };

  return (
    <Animated.View
      ref={boardRef}
      onLayout={measureBoard}
      style={[
        {
          marginBottom: 16,
          height: 192,
          width: 192,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          backgroundColor: '#1e293b',
          borderWidth: 4,
          borderColor: highlight ? '#facc15' : '#334155',
          position: 'relative',
          shadowColor: '#facc15',
          shadowOpacity: highlight ? 1 : 0,
          shadowRadius: highlight ? 30 : 0,
          shadowOffset: { width: 0, height: 0 },
          zIndex: 10,
        },
        highlightStyle,
      ]}>
      <View className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30" />
      <View className="absolute inset-8 rounded-full border-2 border-gray-500 opacity-20" />
      <View className="items-center justify-center">
        <Text className="text-lg font-bold text-white">Game Cards: {gameCards.length}</Text>
        <Text className="text-xs text-gray-400">Drag card here to play</Text>
        {gameCards.length > 0 && (
          <View className="mt-2 h-20 w-14 items-center justify-center">
            {Array.from({ length: Math.min(7, gameCards.length) }).map((_, index) => (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  width: 50,
                  height: 70,
                  transform: [{ rotate: `${(index - 1) * 5}deg` }, { translateY: -index * 2 }],
                }}>
                <Image
                  source={require('../../../assets/card.png')}
                  className="h-full w-full rounded-lg"
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default GameBoard;
