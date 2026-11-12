export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
  };
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
}

export interface YouTubeLiveItem {
  id: string;
  url: string;
  rawUrl: string;
  title: string;
  author: string;
  thumbnail: string;
  embedUrl: string;
}

export type SortOption = 'name_asc' | 'name_desc' | 'date_desc' | 'date_asc';

export type ActiveTab = 'profile' | 'pengumuman' | 'livestream' | 'homili' | 'dokumentasi';
