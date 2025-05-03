import { AppView } from 'components/AppView';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppView />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
