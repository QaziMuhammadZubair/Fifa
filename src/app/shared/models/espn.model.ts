/* ESPN World Cup 2026 API Response Models */

export interface EspnTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color?: string;
  logo?: string;
  alternateColor?: string;
}

export interface EspnCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  winner: boolean;
  score: string;
  team: EspnTeam;
  form?: string;
  records?: { summary: string }[];
  leaders?: EspnLeaderCategory[];
}

export interface EspnLeaderCategory {
  name: string;
  displayName: string;
  leaders: EspnLeader[];
}

export interface EspnLeader {
  displayValue: string;
  value: number;
  athlete: {
    id: string;
    displayName: string;
    shortName: string;
  };
}

export interface EspnStatusType {
  id: string;
  name: string;
  state: 'pre' | 'in' | 'post';
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
}

export interface EspnStatus {
  clock: number;
  displayClock: string;
  period?: number;
  type: EspnStatusType;
}

export interface EspnVenue {
  id: string;
  fullName: string;
  address: {
    city: string;
    country: string;
  };
}

export interface EspnBroadcast {
  market: string;
  names: string[];
}

export interface EspnCompetition {
  id: string;
  date: string;
  startDate: string;
  attendance?: number;
  status: EspnStatus;
  venue?: EspnVenue;
  competitors: EspnCompetitor[];
  broadcasts?: EspnBroadcast[];
  altGameNote?: string;
  geoBroadcasts?: { media: { shortName: string }; type: { shortName: string } }[];
}

export interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: EspnCompetition[];
}

export interface EspnScoreboardResponse {
  leagues: { id: string; name: string; season: { year: number } }[];
  events: EspnEvent[];
}

/* Normalized Match Model */
export interface LiveMatch {
  id: string;
  date: Date;
  utcDateStr: string;
  status: 'pre' | 'in' | 'post';
  statusLabel: string;        // e.g. "45'" or "HT" or "FT" or "Scheduled"
  displayClock: string;
  period: number;
  completed: boolean;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
  homeScore: number;
  awayScore: number;
  venue: string;
  city: string;
  group: string;
  round: string;
  broadcasts: string[];
  attendance?: number;
}

export interface NormalizedTeam {
  id: string;
  name: string;
  abbr: string;
  logo: string;
  flag: string;        // emoji flag derived from abbreviation
  color: string;
  form: string;
}
