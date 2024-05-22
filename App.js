import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { LogBox, View, Text, ActivityIndicator } from 'react-native';
import Start from './components/Start';
import Chat from './components/Chat';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const firebaseConfig = {
    apiKey: "AIzaSyAz23UwaGQ-raZyNrcmCz8inboMA3WD7mM",
    authDomain: "messages-fc1c4.firebaseapp.com",
    projectId: "messages-fc1c4",
    storageBucket: "messages-fc1c4.appspot.com",
    messagingSenderId: "478752550364",
    appId: "1:478752550364:web:e18aaed7da157486c2b319"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({ uid: user.uid, name: user.displayName });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => <Chat {...props} db={db} userID={user?.uid} name={user?.name} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
