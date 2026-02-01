import AsyncStorage from '@react-native-async-storage/async-storage';
import { DownloadedEpisode } from './types';

const SERVER_URL_KEY = '@server_url';
const CURRENT_USER_KEY = '@current_user';
const USERS_KEY = '@users';

// User-specific keys (will be prefixed with username)
function getUserKey(username: string, key: string): string {
  return `@${username}_${key}`;
}

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

// User profile management
export async function getCurrentUser(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function setCurrentUser(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_USER_KEY, username);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

export async function getUsers(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function addUser(username: string): Promise<void> {
  try {
    const users = await getUsers();
    if (!users.includes(username)) {
      users.push(username);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

export async function deleteUser(username: string): Promise<void> {
  try {
    // Remove user from users list
    const users = await getUsers();
    const updated = users.filter(u => u !== username);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    
    // Clear user's data
    await AsyncStorage.removeItem(getUserKey(username, 'downloads'));
    await AsyncStorage.removeItem(getUserKey(username, 'last_watched'));
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Downloads management
export async function getDownloads(): Promise<DownloadedEpisode[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];
    
    const key = getUserKey(currentUser, 'downloads');
    const data = await AsyncStorage.getItem(key);
    const downloads: DownloadedEpisode[] = data ? JSON.parse(data) : [];

    // Simple fix: always return downloads in chronological episode order
    downloads.sort((a, b) => {
      const aSeason = a.episode?.season ?? Number.MAX_SAFE_INTEGER;
      const bSeason = b.episode?.season ?? Number.MAX_SAFE_INTEGER;
      if (aSeason !== bSeason) return aSeason - bSeason;

      const aEp = a.episode?.episode ?? Number.MAX_SAFE_INTEGER;
      const bEp = b.episode?.episode ?? Number.MAX_SAFE_INTEGER;
      if (aEp !== bEp) return aEp - bEp;

      // fallback: newest first (or switch to a.downloadedAt - b.downloadedAt if you prefer oldest first)
      return (b.downloadedAt ?? 0) - (a.downloadedAt ?? 0);
    });

    return downloads;
  } catch (error) {
    console.error('Error getting downloads:', error);
    return [];
  }
}

export async function addDownload(download: DownloadedEpisode): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    
    const downloads = await getDownloads();
    const updated = [...downloads, download];
    const key = getUserKey(currentUser, 'downloads');
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding download:', error);
  }
}

export async function removeDownload(episodeId: string): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    
    const downloads = await getDownloads();
    const updated = downloads.filter(d => d.id !== episodeId);
    const key = getUserKey(currentUser, 'downloads');
    await AsyncStorage.setItem(key, JSON.stringify(updated));
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

// Last watched episode management
export async function getLastWatchedEpisode(): Promise<string | null> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;
    
    const key = getUserKey(currentUser, 'last_watched');
    const episodeId = await AsyncStorage.getItem(key);
    console.log(`[${currentUser}] Getting last watched:`, episodeId);
    return episodeId;
  } catch (error) {
    console.error('Error getting last watched episode:', error);
    return null;
  }
}

export async function setLastWatchedEpisode(episodeId: string): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.warn('No current user set, cannot save last watched');
      return;
    }
    
    const key = getUserKey(currentUser, 'last_watched');
    await AsyncStorage.setItem(key, episodeId);
    console.log(`[${currentUser}] Saved last watched:`, episodeId);
  } catch (error) {
    console.error('Error setting last watched episode:', error);
  }
}