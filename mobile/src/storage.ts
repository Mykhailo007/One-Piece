import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadedEpisode } from './types';

const SERVER_URL_KEY = '@server_url';
const DOWNLOADS_KEY = '@downloads';

// Server URL management
export async function getServerUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SERVER_URL_KEY);
  } catch (error) {
    console.error('Error getting server URL:', error);
    return null;
  }
}

export async function setServerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
  } catch (error) {
    console.error('Error setting server URL:', error);
  }
}

// Downloads management
export async function getDownloads(): Promise<DownloadedEpisode[]> {
  try {
    const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting downloads:', error);
    return [];
  }
}

export async function addDownload(download: DownloadedEpisode): Promise<void> {
  try {
    const downloads = await getDownloads();
    const updated = [...downloads, download];
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding download:', error);
  }
}

export async function removeDownload(episodeId: string): Promise<void> {
  try {
    const downloads = await getDownloads();
    const updated = downloads.filter(d => d.id !== episodeId);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing download:', error);
  }
}

export async function getDownload(episodeId: string): Promise<DownloadedEpisode | null> {
  try {
    const downloads = await getDownloads();
    return downloads.find(d => d.id === episodeId) || null;
  } catch (error) {
    console.error('Error getting download:', error);
    return null;
  }
}
