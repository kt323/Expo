import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import {AsyncStorage} from "@react-native-async-storage/async-storage";

const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const { name, userID, background } = route.params;
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true); 
  const unsubMessagesRef = useRef(null);

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

  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
   }

  let unsubMessages;
  useEffect(() => {
    if (isConnected === true){
    if (unsubMessages) unsubMessages();
    unsubMessages = null;
      navigation.setOptions({ title: username });
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (docs) => {
        let newMessages = [];
        docs.forEach(doc => {
          newMessages.push({ id: doc.id, ...doc.data(),  createdAt: new Date(doc.data().createdAt.toMillis()), })
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();
    
      return () => {
        if (unsubMessages) unsubMessages();
      }
    }, [isConnected]); 
  
    const cacheMessages = async (messagesToCache) => {
      try {
        await AsyncStorage.setItem(
          "messages",
          JSON.stringify(messagesToCache)
        );
      } catch (error) {
        console.log(error.message);
      }
    };

    const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("messages")) || [];
      setMessages(JSON.parse(cachedMessages));
    };

    const renderCustomActions = (props) => {
      return <CustomActions storage={storage} userID={userID} {...props} />;
    };


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


  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: username,
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
