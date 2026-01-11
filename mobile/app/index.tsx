import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { Episode, Catalog } from '../src/types';
import { fetchCatalog, joinUrl } from '../src/api';
import { getServerUrl, addDownload, getDownload } from '../src/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadServerUrl();
  }, []);

  useEffect(() => {
    if (serverUrl) {
      loadCatalog();
    }
  }, [serverUrl]);

  async function loadServerUrl() {
    const url = await getServerUrl();
    setServerUrl(url);
    setLoading(false);
  }

  async function loadCatalog() {
    if (!serverUrl) return;
    
    try {
      setLoading(true);
      const data = await fetchCatalog(serverUrl);
      setCatalog(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch catalog. Check your server URL in Settings.');
      console.error('Failed to fetch catalog:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleDownload(episode: Episode) {
    if (!serverUrl) return;
    
    try {
      setDownloading(prev => new Set(prev).add(episode.id));
      
      const mediaUrl = joinUrl(serverUrl, episode.mediaUrl);
      const fileUri = FileSystem.documentDirectory + `${episode.id}.mp4`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        mediaUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${Math.round(progress * 100)}%`);
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        await addDownload({
          id: episode.id,
          localUri: result.uri,
          downloadedAt: Date.now(),
          title: episode.title,
          episode: episode
        });
        
        Alert.alert('Success', `${episode.title} downloaded!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download episode');
      console.error('Download error:', error);
    } finally {
      setDownloading(prev => {
        const next = new Set(prev);
        next.delete(episode.id);
        return next;
      });
    }
  }

  function handlePlay(episode: Episode) {
    router.push({
      pathname: '/player',
      params: { episodeId: episode.id }
    });
  }

  function renderEpisode({ item }: { item: Episode }) {
    const isDownloading = downloading.has(item.id);
    
    return (
      <View style={styles.episodeCard}>
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle}>{item.title}</Text>
          <Text style={styles.episodeDescription}>{item.description}</Text>
          <Text style={styles.episodeMeta}>
            Season {item.season}, Episode {item.episode} • {Math.round(item.duration / 60)} min
          </Text>
        </View>
        <View style={styles.episodeActions}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handlePlay(item)}
          >
            <Text style={styles.buttonText}>▶ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.downloadButton, isDownloading && styles.disabledButton]}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>⬇ Download</Text>
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

  if (!serverUrl) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Welcome to One Piece</Text>
        <Text style={styles.subtitle}>Configure your server URL to get started</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.primaryButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.serverUrl}>Server: {serverUrl}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/downloads')}
          >
            <Text style={styles.headerButtonText}>Downloads</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.headerButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {catalog && catalog.episodes.length > 0 ? (
        <FlatList
          data={catalog.episodes}
          renderItem={renderEpisode}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCatalog();
              }}
            />
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No episodes available</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => loadCatalog()}
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  serverUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  episodeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  episodeInfo: {
    marginBottom: 12,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  episodeMeta: {
    fontSize: 12,
    color: '#999',
  },
  episodeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#34C759',
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
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});
