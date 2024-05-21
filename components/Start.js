import { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { getAuth, signInAnonymously } from 'firebase/auth';

export const Start = ({ navigation }) => {
  const [username, setName] = useState('');
  const COLORS = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];
  const [bgColor, setBGColor] = useState(COLORS[3]);

  const auth = getAuth();

  const signInUser = () => {
    signInAnonymously(auth)
      .then(res => {
        navigation.navigate("Chat", { userID: res.user.uid, username: username, background: bgColor });
        Alert.alert("Signed in Successfully");
      })
      .catch(err => {
        Alert.alert("Unable to sign in, try later again");
      });
  };

  return (
    <ImageBackground source={require('../image/Background-Image.png')} style={styles.container}>
      <Text style={styles.title}>Chat App</Text>

      <View style={styles.content}>
        <TextInput
          value={username}
          onChangeText={setName}
          style={styles.textInput}
          placeholder="Your Name"
        />
        <Text style={styles.text}>Choose background color</Text>
        <View style={styles.bgColors}>
          {COLORS.map(color => {
            return (
              <View
                key={`custom-${color}`}
                style={{
                  ...styles.colorBlock,
                  backgroundColor: color,
                }}
                onTouchEnd={() => {
                  setBGColor(color);
                }}
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (username === '') {
              Alert.alert('You need a username');
            } else {
              signInUser();
            }
          }}
        >
          <Text style={styles.buttonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    backgroundColor: 'white',
    height: '44%',
    width: '88%',
    padding: '6%',
    marginTop: '60%',
  },
  textInput: {
    width: '88%',
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 100,
  },
  bgColors: {
    flex: 1,
    flexDirection: 'row',
  },
  colorBlock: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#757083',
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});