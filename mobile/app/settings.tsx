import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getServerUrl, setServerUrl } from '../src/storage';
import { testServerConnection } from '../src/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadServerUrl();
  }, []);

  async function loadServerUrl() {
    const savedUrl = await getServerUrl();
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }

  async function handleSave() {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a server URL');
      return;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url.trim())) {
      Alert.alert('Error', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setTesting(true);
    const isConnected = await testServerConnection(url.trim());
    setTesting(false);

    if (isConnected) {
      await setServerUrl(url.trim());
      Alert.alert('Success', 'Server URL saved successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } else {
      Alert.alert(
        'Connection Failed',
        'Could not connect to server. Save anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: async () => {
              await setServerUrl(url.trim());
              router.back();
            }
          }
        ]
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Server URL</Text>
        <Text style={styles.hint}>
          Enter your PC's IP address and port (e.g., http://192.168.1.100:3000)
        </Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.100:3000"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <TouchableOpacity 
          style={[styles.button, testing && styles.disabledButton]}
          onPress={handleSave}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing Connection...' : 'Save'}
          </Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to find your PC's IP:</Text>
          <Text style={styles.instructionsText}>
            1. On Windows, open Command Prompt{'\n'}
            2. Type: ipconfig{'\n'}
            3. Look for "IPv4 Address" (e.g., 192.168.1.100){'\n'}
            4. Use format: http://YOUR_IP:3000
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
