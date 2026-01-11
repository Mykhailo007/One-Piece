import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getServerUrl, getDownload } from '../src/storage';
import { joinUrl, fetchCatalog } from '../src/api';
import { Episode } from '../src/types';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const episodeId = params.episodeId as string;
  
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = React.useRef<Video>(null);

  useEffect(() => {
    loadVideo();
  }, [episodeId]);

  async function loadVideo() {
    try {
      setLoading(true);
      setError(null);

      // Check if episode is downloaded
      const downloaded = await getDownload(episodeId);
      
      if (downloaded) {
        // Play from local storage
        const fileInfo = await FileSystem.getInfoAsync(downloaded.localUri);
        if (fileInfo.exists) {
          setVideoUri(downloaded.localUri);
          setLoading(false);
          return;
        }
      }

      // Stream from server
      const serverUrl = await getServerUrl();
      if (!serverUrl) {
        setError('Server URL not configured');
        setLoading(false);
        return;
      }

      // Fetch catalog to get episode details
      const catalog = await fetchCatalog(serverUrl);
      const episode = catalog.episodes.find((ep: Episode) => ep.id === episodeId);
      
      if (!episode) {
        setError('Episode not found');
        setLoading(false);
        return;
      }

      const streamUrl = joinUrl(serverUrl, episode.mediaUrl);
      setVideoUri(streamUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
      setLoading(false);
    }
  }

  function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
        setError('Playback error occurred');
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  if (error || !videoUri) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Video not available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
