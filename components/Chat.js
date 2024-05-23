import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { getDocs, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const Chat = ({ route, navigation, db }) => {
  const { name, userID, background } = route.params;
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  let unsubMessages;

  useEffect(() => {
    navigation.setOptions({ title: name });

    if (isConnected) {
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (querySnapshot) => {
        const newMessages = [];
        querySnapshot.forEach((doc) => {
          newMessages.push({
            _id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(), 
          });
        });
        setMessages(newMessages);
      });
    }

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  const onSend = async (newMessages) => {
    const message = newMessages[0];

    console.log("Attempting to send message:", message);
    console.log("User ID:", userID);
    console.log("User name:", name);

    if (!userID || !name) {
      Alert.alert("User information missing", "Cannot send message without user ID and name.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "messages"), {
        text: message.text,
        createdAt: serverTimestamp(),
        user: {
          _id: userID,
          name,
        },
      });
      await docRef.update({
        _id: docRef.id
      });
      console.log("Message added to Firestore:", message);
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
      {(Platform.OS === 'android' || Platform.OS === 'ios') && <KeyboardAvoidingView behavior="height" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
