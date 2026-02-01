import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import { Episode, Catalog } from '../src/types';
import { fetchCatalog, joinUrl } from '../src/api';
import { 
  getServerUrl, 
  addDownload, 
  getDownloads, 
  setLastWatchedEpisode, 
  getLastWatchedEpisode,
  getCurrentUser 
} from '../src/storage';
import UserSelectModal from './UserSelectModal';

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = React.useRef<FlatList>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [lastWatchedId, setLastWatchedId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const [offline, setOffline] = useState(false);

 // MIN DIFF: cache downloaded ids so we can disable the Download button
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  // ✅ ADD THESE TWO useEffects
  useEffect(() => {
    checkUser();
    loadServerUrl();
  }, []);

  useEffect(() => {
    if (serverUrl && currentUser) {
      loadCatalog();
      refreshDownloadedIds();
    }
  }, [serverUrl, currentUser]);

  async function checkUser() {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setShowUserModal(true);
    }
  }

  function handleUserSelected(username: string) {
    setCurrentUser(username);
    setShowUserModal(false);
    // Refresh data for new user
    if (serverUrl) {
      loadCatalog();
      refreshDownloadedIds();
    }
  }

  async function refreshDownloadedIds() {
    try {
      const all = await getDownloads();

      // Only count downloads whose files still exist
      const verified = await Promise.all(
        all.map(async (d) => {
          const info = await FileSystem.getInfoAsync(d.localUri);
          return info.exists ? d.id : null;
        })
      );

      setDownloadedIds(new Set(verified.filter(Boolean) as string[]));
    } catch (e) {
      console.error('Failed to refresh downloads:', e);
    }
  }

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
      setOffline(false);
      
      // Load last watched
      const lastWatched = await getLastWatchedEpisode();
      if (lastWatched) {
        setLastWatchedId(lastWatched);
      }
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function scrollToLastWatched() {
    if (!catalog || !lastWatchedId) {
      console.log('Cannot scroll: no catalog or lastWatchedId');
      return;
    }
    
    const index = catalog.episodes.findIndex(ep => ep.id === lastWatchedId);
    console.log('Scrolling to index:', index, 'for episode:', lastWatchedId);
    
    if (index >= 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        console.log('scrollToIndex failed, trying scrollToOffset');
        // Fallback: estimate offset (each item is roughly 150px)
        flatListRef.current.scrollToOffset({
          offset: index * 150,
          animated: true,
        });
      }
    }
  }

  async function handleDownload(episode: Episode) {
    if (!serverUrl) return;

    // MIN DIFF: prevent re-download
    if (downloadedIds.has(episode.id)) {
      Alert.alert('Already downloaded', `${episode.title} is already on your phone.`);
      return;
    }

    try {
      setDownloading(prev => new Set(prev).add(episode.id));

      const mediaUrl = joinUrl(serverUrl, episode.mediaUrl);
      const fileUri = FileSystem.documentDirectory + `${episode.id}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        mediaUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
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
          episode: episode,
        });

        // MIN DIFF: update UI immediately
        setDownloadedIds(prev => {
          const next = new Set(prev);
          next.add(episode.id);
          return next;
        });

        Alert.alert('Success', `${episode.title} downloaded!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);

      Alert.alert('Download error', message);
      console.error('Download error:', error);
    } finally {
      setDownloading(prev => {
        const next = new Set(prev);
        next.delete(episode.id);
        return next;
      });
    }
  }

  async function handlePlay(episode: Episode) {
    // Save as last watched
    await setLastWatchedEpisode(episode.id);
    setLastWatchedId(episode.id);
    
    router.push({
      pathname: '/player',
      params: { episodeId: episode.id },
    });
  }

  function renderEpisode({ item }: { item: Episode }) {
    const isDownloading = downloading.has(item.id);
    const isDownloaded = downloadedIds.has(item.id);
    const isLastWatched = item.id === lastWatchedId;

    const downloadDisabled = isDownloading || isDownloaded;

    return (
      <View style={[styles.episodeCard, isLastWatched && styles.lastWatchedCard]}>
        <View style={styles.episodeInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.episodeTitle}>{item.title}</Text>
            {isLastWatched && <Text style={styles.lastWatchedBadge}>Last Watched</Text>}
          </View>
          <Text style={styles.episodeDescription}>{item.description}</Text>
          <Text style={styles.episodeMeta}>
            Season {item.season}, Episode {item.episode} • {Math.round(item.duration / 60)} min
          </Text>
        </View>

        <View style={styles.episodeActions}>
          <TouchableOpacity style={styles.button} onPress={() => handlePlay(item)}>
            <Text style={styles.buttonText}>▶ Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.downloadButton,
              downloadDisabled && styles.disabledButton,
            ]}
            onPress={() => handleDownload(item)}
            disabled={downloadDisabled}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isDownloaded ? '✓ Downloaded' : '⬇ Download'}
              </Text>
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/settings')}>
          <Text style={styles.primaryButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (offline) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Offline</Text>
        <Text style={styles.subtitle}>
          You’re offline, so the catalog can’t load. You can still watch downloaded episodes.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/downloads')}>
          <Text style={styles.primaryButtonText}>Go to Downloads</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => loadCatalog()}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <UserSelectModal 
        visible={showUserModal} 
        onUserSelected={handleUserSelected}
      />

      <View style={styles.header}>
        <Text style={styles.serverUrl}>Server: {serverUrl}</Text>
        <View style={styles.headerRow}>
          {currentUser && (
            <TouchableOpacity onPress={() => setShowUserModal(true)}>
              <Text style={styles.userText}>👤 {currentUser}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/downloads')}>
            <Text style={styles.headerButtonText}>Downloads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
            <Text style={styles.headerButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {lastWatchedId && catalog && (
        <TouchableOpacity 
          style={styles.jumpButton}
          onPress={scrollToLastWatched}
        >
          <Text style={styles.jumpButtonText}>⬇ Jump to Last Watched</Text>
        </TouchableOpacity>
      )}

      {catalog && catalog.episodes.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={catalog.episodes}
          renderItem={renderEpisode}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          getItemLayout={(data, index) => ({
            length: 160,
            offset: 160 * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            // Fallback if scroll fails
            console.log('onScrollToIndexFailed:', info);
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                refreshDownloadedIds();
                loadCatalog();
              }}
            />
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No episodes available</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => loadCatalog()}>
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
    marginBottom: 4,
  },
  userText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  jumpButton: {
    backgroundColor: '#007AFF',
    margin: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jumpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  lastWatchedCard: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lastWatchedBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});