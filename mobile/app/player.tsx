import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const videoRef = React.useRef<Video>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Default skip times (used if episode doesn't have introEnd)
  const DEFAULT_SKIP_TIME = 225;
  const DEFAULT_SHOW_UNTIL = 300;

  useEffect(() => {
    // Reset video state when episode changes
    setVideoUri(null);
    setEpisode(null);
    setShowSkipButton(false);
    loadVideo();
  }, [episodeId]);

  async function loadVideo() {
    try {
      setLoading(true);
      setError(null);

      // iOS: allow audio even when the phone is in silent mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

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
      const episodeData = catalog.episodes.find((ep: Episode) => ep.id === episodeId);

      if (!episodeData) {
        setError('Episode not found');
        setLoading(false);
        return;
      }

      setEpisode(episodeData);
      const streamUrl = joinUrl(serverUrl, episodeData.mediaUrl);
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
      return;
    }

    // Update current time
    const positionSeconds = (status.positionMillis || 0) / 1000;
    setCurrentTime(positionSeconds);

    // Use episode-specific intro end time or default
    const showUntil = episode?.introEnd || DEFAULT_SHOW_UNTIL;

    // Show skip button during intro/recap period
    if (positionSeconds < showUntil && !showSkipButton) {
      setShowSkipButton(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (positionSeconds >= showUntil && showSkipButton) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSkipButton(false));
    }
  }

  async function skipIntro() {
    if (videoRef.current) {
      const skipTo = episode?.introEnd || DEFAULT_SKIP_TIME;
      await videoRef.current.setPositionAsync(skipTo * 1000);
      // Hide button after skip
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSkipButton(false));
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
      
      {showSkipButton && (
        <Animated.View style={[styles.skipButtonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.skipButton} onPress={skipIntro}>
            <Text style={styles.skipButtonText}>Skip Intro ⏩</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  skipButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  skipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});