import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppView } from 'screens/AppView';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import './global.css';

const USER_ID_KEY = 'unique_user_id';

export default function App() {
  const { getItem, setItem } = useAsyncStorage(USER_ID_KEY);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrCreateUserId = async () => {
      try {
        const existingId = await getItem();
        if (existingId) {
          setUserId(existingId);
        } else {
          const newId = uuidv4();
          await setItem(newId);
          setUserId(newId);
        }
      } catch (error) {
        console.error('Error handling user ID:', error);
      }
    };

    loadOrCreateUserId();
  }, [getItem, setItem]);

  console.log(userId);

  return (
    <SafeAreaProvider>
      <AppView />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
