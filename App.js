import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();


const App = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Screen1"
        >
          <Stack.Screen
            name="Screen1"
            component={Screen1}
          />
          <Stack.Screen
            name="Screen2"
            component={Screen2}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

export default App;
