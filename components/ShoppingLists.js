import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";

const ShoppingListItem = ({ name, items }) => (
  <View style={styles.listItem}>
    <Text style={styles.listName}>{name}</Text>
    <Text style={styles.listItems}>{items.join(', ')}</Text>
  </View>
);

const ShoppingLists = ({ db, route }) => {
    const { userID } = route.params;
  const [lists, setLists] = useState([
    { id: '1', name: 'Halloween Party', items: ['red wine', 'popcorn', 'licorice'], uid: userID },
    { id: '2', name: 'Birthday Cake', items: ['flour', 'eggs', 'butter', 'sugar'], uid: userID },
  ]);
  const [listName, setListName] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');

  useEffect(() => {
    const q = query(collection(db, "shoppinglists"), where("uid", "==", userID));
    const unsubShoppinglists = onSnapshot(q, (documentsSnapshot) => {
      let newLists = [];
      documentsSnapshot.forEach(doc => {
        newLists.push({ id: doc.id, ...doc.data() })
      });
      setLists(newLists);
    });

    // Clean up code
    return () => {
      if (unsubShoppinglists) unsubShoppinglists();
    }
  }, []);

  const addShoppingList = async () => {
    if (listName.trim() === '' || item1.trim() === '' || item2.trim() === '') {
      Alert.alert('Please fill in all the fields');
      return;
    }

    try {
      const newList = {
        uid: userID,
        name: listName.trim(),
        items: [item1.trim(), item2.trim()],
      };
      const newListRef = await addDoc(collection(db, 'shoppinglists'), newList);
      if (newListRef.id) {
        setListName('');
        setItem1('');
        setItem2('');
        Alert.alert(`The list "${listName}" has been added.`);
      } else {
        Alert.alert('Unable to add. Please try later');
      }
    } catch (error) {
      console.error('Error adding shopping list: ', error);
      Alert.alert('Unable to add. Please try later');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.listContainer}>
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShoppingListItem name={item.name} items={item.items} />
          )}
        />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="List Name"
          value={listName}
          onChangeText={setListName}
        />
        <TextInput
          style={styles.input}
          placeholder="Item #1"
          value={item1}
          onChangeText={setItem1}
        />
        <TextInput
          style={styles.input}
          placeholder="Item #2"
          value={item2}
          onChangeText={setItem2}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            const newList = {
              uid: userID,
              name: listName,
              items: [item1, item2]
            }
            addShoppingList(newList);
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 3,
    marginBottom: 10,
  },
  formContainer: {
    flex: 2,
    padding: 16,
    backgroundColor: '#CCC',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#AAA',
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItems: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShoppingLists;