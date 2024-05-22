import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { addDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";

const Chat = ({ route, navigation, db, userID, name }) => {
  const { background } = route.params;
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("Chat component mounted with userID:", userID, "and name:", name);
    if (!userID || !name) {
      Alert.alert("Missing parameters", "User ID or name is missing.");
      return;
    }
  }, [userID, name]);

  const cacheMessagesHistory = useCallback((newMessages) => {
    console.log("Caching messages history:", newMessages);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: name });
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMessages = onSnapshot(q, (docs) => {
      let newMessages = [];
      docs.forEach(doc => {
        newMessages.push({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt.toMillis())
        })
      })
      setMessages(newMessages);
    })
    return () => {
      if (unsubMessages) unsubMessages();
    }
   }, []);

  const onSend = async (newMessages) => {
    const message = newMessages[0];
    console.log("Attempting to send message:", message); 
    console.log("User ID:", userID); 
    console.log("User name:", name); 
    if (!userID || !name) {
      Alert.alert("User information missing", "Cannot send message without user ID and name.");
      return;
    }
    const messageData = {
      text: message.text,
      createdAt: new Date(),
      user: {
        _id: userID,
        name,
      },
    };
    console.log("Message data to send:", messageData);
    try {
      await addDoc(collection(db, "messages"), messageData);
      console.log("Message added to Firestore:", messageData);
    } catch (error) {
      Alert.alert("Error sending message", error.message);
      console.error("Error adding message to Firestore:", error);
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#000",
        },
        left: {
          backgroundColor: "#FFF",
        },
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name,
        }}
      />
       { Platform.OS === 'android' || Platform.OS === 'ios' ?
            <KeyboardAvoidingView behavior="height" /> : null }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
