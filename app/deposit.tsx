import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getUserSession } from "@/utils/functions";
import { View, Text } from 'react-native';


export default function DepositScreen() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted && loaded) {
      async function checkUserState() {
        const Id = await getUserSession();
        console.log(Id);
        if (Id) {
          console.log('User is logged in:', Id);
          // router.replace('/(tabs)');
        } else {
          console.log('User should login');
          router.replace('/login');
        }
      }

      checkUserState();
    }
  }, [isMounted, loaded]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}