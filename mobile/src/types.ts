export interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  description: string;
  mediaUrl: string;
  imageUrl: string;
  duration: number;
}

export interface Catalog {
  episodes: Episode[];
}

export interface DownloadedEpisode {
  id: string;
  localUri: string;
  downloadedAt: number;
  title: string;
  episode: Episode;
}
