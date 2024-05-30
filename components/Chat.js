import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const Chat = ({ route, navigation, db }) => {
  const { name, userID, background } = route.params;
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true); 
  const unsubMessagesRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: name });

    if (isConnected) {
      if (unsubMessagesRef.current) {
        unsubMessagesRef.current();
      }

      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessagesRef.current = onSnapshot(q, (querySnapshot) => {
        const newMessages = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            _id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          });
        });
        setMessages(newMessages);
      });
    }

    return () => {
      if (unsubMessagesRef.current) {
        unsubMessagesRef.current();
      }
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
      await addDoc(collection(db, "messages"), {
        text: message.text,
        createdAt: serverTimestamp(),
        user: {
          _id: userID,
          name,
        },
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
