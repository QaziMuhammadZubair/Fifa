export interface StreamSource {
  id: string;
  label: string;
  url: string;
  type: 'youtube' | 'twitch' | 'iframe' | 'hls';
  quality?: string;
  language?: string;
}

export interface LiveStream {
  matchId: number;
  matchTitle: string;
  teams: string;
  date: string;
  time: string;
  isLive: boolean;
  thumbnail?: string;
  sources: StreamSource[];
  viewerCount?: number;
}
