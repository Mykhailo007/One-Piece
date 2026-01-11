import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { DownloadedEpisode } from '../src/types';
import { getDownloads, removeDownload } from '../src/storage';

export default function DownloadsScreen() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadedEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDownloads();
  }, []);

  async function loadDownloads() {
    try {
      setLoading(true);
      const data = await getDownloads();
      
      // Verify files still exist
      const verified = await Promise.all(
        data.map(async (download) => {
          const fileInfo = await FileSystem.getInfoAsync(download.localUri);
          return fileInfo.exists ? download : null;
        })
      );
      
      setDownloads(verified.filter(d => d !== null) as DownloadedEpisode[]);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(download: DownloadedEpisode) {
    Alert.alert(
      'Delete Download',
      `Delete ${download.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(prev => new Set(prev).add(download.id));
              
              // Delete file
              await FileSystem.deleteAsync(download.localUri, { idempotent: true });
              
              // Remove from storage
              await removeDownload(download.id);
              
              // Update UI
              setDownloads(prev => prev.filter(d => d.id !== download.id));
              
              Alert.alert('Success', 'Download deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete download');
              console.error('Delete error:', error);
            } finally {
              setDeleting(prev => {
                const next = new Set(prev);
                next.delete(download.id);
                return next;
              });
            }
          }
        }
      ]
    );
  }

  function handlePlay(download: DownloadedEpisode) {
    router.push({
      pathname: '/player',
      params: { episodeId: download.id }
    });
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  function renderDownload({ item }: { item: DownloadedEpisode }) {
    const isDeleting = deleting.has(item.id);
    
    return (
      <View style={styles.downloadCard}>
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadTitle}>{item.title}</Text>
          <Text style={styles.downloadMeta}>
            Downloaded: {formatDate(item.downloadedAt)}
          </Text>
          <Text style={styles.downloadDescription}>
            {item.episode.description}
          </Text>
        </View>
        <View style={styles.downloadActions}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => handlePlay(item)}
          >
            <Text style={styles.buttonText}>▶ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🗑 Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (downloads.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No downloads yet</Text>
        <Text style={styles.emptySubtext}>
          Download episodes from the home screen to watch offline
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={downloads}
        renderItem={renderDownload}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  downloadCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  downloadInfo: {
    marginBottom: 12,
  },
  downloadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  downloadMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  downloadDescription: {
    fontSize: 14,
    color: '#666',
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
