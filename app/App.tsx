import { GameScreen } from 'components/GameScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
