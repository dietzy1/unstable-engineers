import { View, Text } from 'react-native';

export function Header() {
  return (
    <View className="mb-6 items-center px-4">
      <Text className="text-4xl font-bold text-white">
        <Text className="text-amber-500">Unstable</Text> Engineers
      </Text>
      <Text className="mt-1 text-sm text-gray-400">Card Battle Arena</Text>
    </View>
  );
}
