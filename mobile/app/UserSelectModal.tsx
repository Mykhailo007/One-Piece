import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { getUsers, addUser, setCurrentUser, deleteUser } from '../src/storage';

interface UserSelectModalProps {
  visible: boolean;
  onUserSelected: (username: string) => void;
}

export default function UserSelectModal({ visible, onUserSelected }: UserSelectModalProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  async function loadUsers() {
    const userList = await getUsers();
    setUsers(userList);
  }

  async function handleSelectUser(username: string) {
    await setCurrentUser(username);
    onUserSelected(username);
  }

  async function handleAddUser() {
    const username = newUsername.trim();
    if (!username) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (users.includes(username)) {
      Alert.alert('Error', 'This profile already exists');
      return;
    }

    await addUser(username);
    await setCurrentUser(username);
    setNewUsername('');
    setShowAddUser(false);
    onUserSelected(username);
  }

  async function handleDeleteUser(username: string) {
    Alert.alert(
      'Delete Profile',
      `Delete ${username}'s profile and all their data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUser(username);
            loadUsers();
          },
        },
      ]
    );
  }

  if (showAddUser) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.addUserContainer}>
            <Text style={styles.title}>Create Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#666"
              value={newUsername}
              onChangeText={setNewUsername}
              autoFocus
              maxLength={20}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddUser(false);
                  setNewUsername('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleAddUser}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Who's Watching?</Text>
          
          <FlatList
            data={users}
            keyExtractor={(item) => item}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={styles.userCardWrapper}>
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => handleSelectUser(item)}
                  onLongPress={() => handleDeleteUser(item)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{item}</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.userCard, styles.addUserCard]}
                  onPress={() => setShowAddUser(true)}
                >
                  <View style={[styles.avatar, styles.addAvatar]}>
                    <Text style={styles.addAvatarText}>+</Text>
                  </View>
                  <Text style={styles.userName}>Add Profile</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 600,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  row: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  userCardWrapper: {
    padding: 10,
  },
  userCard: {
    alignItems: 'center',
    width: 120,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  addUserCard: {
    opacity: 0.7,
  },
  addAvatar: {
    backgroundColor: '#333',
  },
  addAvatarText: {
    fontSize: 60,
    color: '#666',
  },
  addUserContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    width: '90%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  createButton: {
    backgroundColor: '#e50914',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
