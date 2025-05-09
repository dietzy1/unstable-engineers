import { Header } from 'components/Header';
import { View, Text, ActivityIndicator, SafeAreaView, Image } from 'react-native';

export const LoadingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 items-center justify-center p-4">
        <Header />
        <Image
          source={require('assets/image.png')}
          className="mb-6 h-32 w-32"
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="mt-4 text-center text-gray-400">Connecting to game server...</Text>
      </View>
    </SafeAreaView>
  );
};
