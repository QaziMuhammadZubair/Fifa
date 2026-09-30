export interface Team {
  name: string;
  flag: string;
  code: string;
  group: string;
}

export interface Match {
  id: number;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  venue: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  group?: string;
  round: 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Third Place' | 'Final';
  status: 'upcoming' | 'live' | 'finished';
  streamUrl?: string;
}
