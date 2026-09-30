import { Match, Team } from '../models/match.model';

export const GROUPS: Record<string, Team[]> = {
  A: [
    { name: 'Qatar', flag: '🇶🇦', code: 'QAT', group: 'A' },
    { name: 'Ecuador', flag: '🇪🇨', code: 'ECU', group: 'A' },
    { name: 'Senegal', flag: '🇸🇳', code: 'SEN', group: 'A' },
    { name: 'Netherlands', flag: '🇳🇱', code: 'NED', group: 'A' },
  ],
  B: [
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', group: 'B' },
    { name: 'Iran', flag: '🇮🇷', code: 'IRN', group: 'B' },
    { name: 'USA', flag: '🇺🇸', code: 'USA', group: 'B' },
    { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'WAL', group: 'B' },
  ],
  C: [
    { name: 'Argentina', flag: '🇦🇷', code: 'ARG', group: 'C' },
    { name: 'Saudi Arabia', flag: '🇸🇦', code: 'KSA', group: 'C' },
    { name: 'Mexico', flag: '🇲🇽', code: 'MEX', group: 'C' },
    { name: 'Poland', flag: '🇵🇱', code: 'POL', group: 'C' },
  ],
  D: [
    { name: 'France', flag: '🇫🇷', code: 'FRA', group: 'D' },
    { name: 'Australia', flag: '🇦🇺', code: 'AUS', group: 'D' },
    { name: 'Denmark', flag: '🇩🇰', code: 'DEN', group: 'D' },
    { name: 'Tunisia', flag: '🇹🇳', code: 'TUN', group: 'D' },
  ],
  E: [
    { name: 'Spain', flag: '🇪🇸', code: 'ESP', group: 'E' },
    { name: 'Costa Rica', flag: '🇨🇷', code: 'CRC', group: 'E' },
    { name: 'Germany', flag: '🇩🇪', code: 'GER', group: 'E' },
    { name: 'Japan', flag: '🇯🇵', code: 'JPN', group: 'E' },
  ],
  F: [
    { name: 'Belgium', flag: '🇧🇪', code: 'BEL', group: 'F' },
    { name: 'Canada', flag: '🇨🇦', code: 'CAN', group: 'F' },
    { name: 'Morocco', flag: '🇲🇦', code: 'MAR', group: 'F' },
    { name: 'Croatia', flag: '🇭🇷', code: 'CRO', group: 'F' },
  ],
  G: [
    { name: 'Brazil', flag: '🇧🇷', code: 'BRA', group: 'G' },
    { name: 'Serbia', flag: '🇷🇸', code: 'SRB', group: 'G' },
    { name: 'Switzerland', flag: '🇨🇭', code: 'SUI', group: 'G' },
    { name: 'Cameroon', flag: '🇨🇲', code: 'CMR', group: 'G' },
  ],
  H: [
    { name: 'Portugal', flag: '🇵🇹', code: 'POR', group: 'H' },
    { name: 'Ghana', flag: '🇬🇭', code: 'GHA', group: 'H' },
    { name: 'Uruguay', flag: '🇺🇾', code: 'URU', group: 'H' },
    { name: 'South Korea', flag: '🇰🇷', code: 'KOR', group: 'H' },
  ],
};

export const MATCHES: Match[] = [
  // Group A
  { id: 1, date: '2026-06-11', time: '20:00', homeTeam: GROUPS['A'][0], awayTeam: GROUPS['A'][1], venue: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', group: 'A', round: 'Group Stage', status: 'finished', homeScore: 0, awayScore: 2 },
  { id: 2, date: '2026-06-12', time: '14:00', homeTeam: GROUPS['A'][2], awayTeam: GROUPS['A'][3], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'A', round: 'Group Stage', status: 'finished', homeScore: 0, awayScore: 2 },
  { id: 3, date: '2026-06-16', time: '20:00', homeTeam: GROUPS['A'][0], awayTeam: GROUPS['A'][2], venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', group: 'A', round: 'Group Stage', status: 'live' },
  { id: 4, date: '2026-06-16', time: '17:00', homeTeam: GROUPS['A'][3], awayTeam: GROUPS['A'][1], venue: 'Levi\'s Stadium', city: 'San Francisco', country: 'USA', group: 'A', round: 'Group Stage', status: 'live' },
  { id: 5, date: '2026-06-20', time: '20:00', homeTeam: GROUPS['A'][3], awayTeam: GROUPS['A'][0], venue: 'AT&T Stadium', city: 'Dallas', country: 'USA', group: 'A', round: 'Group Stage', status: 'upcoming' },
  { id: 6, date: '2026-06-20', time: '20:00', homeTeam: GROUPS['A'][1], awayTeam: GROUPS['A'][2], venue: 'Gillette Stadium', city: 'Boston', country: 'USA', group: 'A', round: 'Group Stage', status: 'upcoming' },

  // Group B
  { id: 7, date: '2026-06-13', time: '14:00', homeTeam: GROUPS['B'][0], awayTeam: GROUPS['B'][1], venue: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', group: 'B', round: 'Group Stage', status: 'finished', homeScore: 6, awayScore: 2 },
  { id: 8, date: '2026-06-13', time: '20:00', homeTeam: GROUPS['B'][2], awayTeam: GROUPS['B'][3], venue: 'BC Place', city: 'Vancouver', country: 'Canada', group: 'B', round: 'Group Stage', status: 'finished', homeScore: 1, awayScore: 1 },
  { id: 9, date: '2026-06-17', time: '14:00', homeTeam: GROUPS['B'][0], awayTeam: GROUPS['B'][2], venue: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', group: 'B', round: 'Group Stage', status: 'upcoming' },
  { id: 10, date: '2026-06-17', time: '20:00', homeTeam: GROUPS['B'][3], awayTeam: GROUPS['B'][1], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'B', round: 'Group Stage', status: 'upcoming' },
  { id: 11, date: '2026-06-21', time: '16:00', homeTeam: GROUPS['B'][3], awayTeam: GROUPS['B'][0], venue: 'BMO Field', city: 'Toronto', country: 'Canada', group: 'B', round: 'Group Stage', status: 'upcoming' },
  { id: 12, date: '2026-06-21', time: '16:00', homeTeam: GROUPS['B'][1], awayTeam: GROUPS['B'][2], venue: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', group: 'B', round: 'Group Stage', status: 'upcoming' },

  // Group C
  { id: 13, date: '2026-06-14', time: '17:00', homeTeam: GROUPS['C'][0], awayTeam: GROUPS['C'][1], venue: 'Lusail Stadium', city: 'Guadalajara', country: 'Mexico', group: 'C', round: 'Group Stage', status: 'finished', homeScore: 2, awayScore: 1 },
  { id: 14, date: '2026-06-14', time: '20:00', homeTeam: GROUPS['C'][2], awayTeam: GROUPS['C'][3], venue: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', group: 'C', round: 'Group Stage', status: 'finished', homeScore: 0, awayScore: 2 },
  { id: 15, date: '2026-06-18', time: '17:00', homeTeam: GROUPS['C'][0], awayTeam: GROUPS['C'][2], venue: 'NRG Stadium', city: 'Houston', country: 'USA', group: 'C', round: 'Group Stage', status: 'upcoming' },
  { id: 16, date: '2026-06-18', time: '20:00', homeTeam: GROUPS['C'][3], awayTeam: GROUPS['C'][1], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'C', round: 'Group Stage', status: 'upcoming' },
  { id: 17, date: '2026-06-22', time: '20:00', homeTeam: GROUPS['C'][3], awayTeam: GROUPS['C'][0], venue: 'Hard Rock Stadium', city: 'Miami', country: 'USA', group: 'C', round: 'Group Stage', status: 'upcoming' },
  { id: 18, date: '2026-06-22', time: '20:00', homeTeam: GROUPS['C'][1], awayTeam: GROUPS['C'][2], venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', group: 'C', round: 'Group Stage', status: 'upcoming' },

  // Group D
  { id: 19, date: '2026-06-15', time: '14:00', homeTeam: GROUPS['D'][0], awayTeam: GROUPS['D'][1], venue: 'Stade Olympique', city: 'Montreal', country: 'Canada', group: 'D', round: 'Group Stage', status: 'finished', homeScore: 4, awayScore: 1 },
  { id: 20, date: '2026-06-15', time: '20:00', homeTeam: GROUPS['D'][2], awayTeam: GROUPS['D'][3], venue: 'AT&T Stadium', city: 'Dallas', country: 'USA', group: 'D', round: 'Group Stage', status: 'finished', homeScore: 0, awayScore: 0 },
  { id: 21, date: '2026-06-19', time: '14:00', homeTeam: GROUPS['D'][0], awayTeam: GROUPS['D'][2], venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', group: 'D', round: 'Group Stage', status: 'upcoming' },
  { id: 22, date: '2026-06-19', time: '20:00', homeTeam: GROUPS['D'][3], awayTeam: GROUPS['D'][1], venue: 'NRG Stadium', city: 'Houston', country: 'USA', group: 'D', round: 'Group Stage', status: 'upcoming' },
  { id: 23, date: '2026-06-23', time: '20:00', homeTeam: GROUPS['D'][3], awayTeam: GROUPS['D'][0], venue: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', group: 'D', round: 'Group Stage', status: 'upcoming' },
  { id: 24, date: '2026-06-23', time: '20:00', homeTeam: GROUPS['D'][1], awayTeam: GROUPS['D'][2], venue: 'Gillette Stadium', city: 'Boston', country: 'USA', group: 'D', round: 'Group Stage', status: 'upcoming' },

  // Group E
  { id: 25, date: '2026-06-16', time: '14:00', homeTeam: GROUPS['E'][0], awayTeam: GROUPS['E'][1], venue: 'Levi\'s Stadium', city: 'San Francisco', country: 'USA', group: 'E', round: 'Group Stage', status: 'upcoming' },
  { id: 26, date: '2026-06-16', time: '14:00', homeTeam: GROUPS['E'][2], awayTeam: GROUPS['E'][3], venue: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', group: 'E', round: 'Group Stage', status: 'upcoming' },
  { id: 27, date: '2026-06-20', time: '14:00', homeTeam: GROUPS['E'][0], awayTeam: GROUPS['E'][2], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'E', round: 'Group Stage', status: 'upcoming' },
  { id: 28, date: '2026-06-20', time: '14:00', homeTeam: GROUPS['E'][3], awayTeam: GROUPS['E'][1], venue: 'BC Place', city: 'Vancouver', country: 'Canada', group: 'E', round: 'Group Stage', status: 'upcoming' },
  { id: 29, date: '2026-06-24', time: '20:00', homeTeam: GROUPS['E'][3], awayTeam: GROUPS['E'][0], venue: 'AT&T Stadium', city: 'Dallas', country: 'USA', group: 'E', round: 'Group Stage', status: 'upcoming' },
  { id: 30, date: '2026-06-24', time: '20:00', homeTeam: GROUPS['E'][1], awayTeam: GROUPS['E'][2], venue: 'NRG Stadium', city: 'Houston', country: 'USA', group: 'E', round: 'Group Stage', status: 'upcoming' },

  // Group F
  { id: 31, date: '2026-06-17', time: '14:00', homeTeam: GROUPS['F'][0], awayTeam: GROUPS['F'][1], venue: 'BMO Field', city: 'Toronto', country: 'Canada', group: 'F', round: 'Group Stage', status: 'upcoming' },
  { id: 32, date: '2026-06-17', time: '14:00', homeTeam: GROUPS['F'][2], awayTeam: GROUPS['F'][3], venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', group: 'F', round: 'Group Stage', status: 'upcoming' },
  { id: 33, date: '2026-06-21', time: '14:00', homeTeam: GROUPS['F'][0], awayTeam: GROUPS['F'][2], venue: 'Hard Rock Stadium', city: 'Miami', country: 'USA', group: 'F', round: 'Group Stage', status: 'upcoming' },
  { id: 34, date: '2026-06-21', time: '14:00', homeTeam: GROUPS['F'][3], awayTeam: GROUPS['F'][1], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'F', round: 'Group Stage', status: 'upcoming' },
  { id: 35, date: '2026-06-25', time: '20:00', homeTeam: GROUPS['F'][3], awayTeam: GROUPS['F'][0], venue: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', group: 'F', round: 'Group Stage', status: 'upcoming' },
  { id: 36, date: '2026-06-25', time: '20:00', homeTeam: GROUPS['F'][1], awayTeam: GROUPS['F'][2], venue: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', group: 'F', round: 'Group Stage', status: 'upcoming' },

  // Group G
  { id: 37, date: '2026-06-18', time: '14:00', homeTeam: GROUPS['G'][0], awayTeam: GROUPS['G'][1], venue: 'Levi\'s Stadium', city: 'San Francisco', country: 'USA', group: 'G', round: 'Group Stage', status: 'upcoming' },
  { id: 38, date: '2026-06-18', time: '14:00', homeTeam: GROUPS['G'][2], awayTeam: GROUPS['G'][3], venue: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', group: 'G', round: 'Group Stage', status: 'upcoming' },
  { id: 39, date: '2026-06-22', time: '14:00', homeTeam: GROUPS['G'][0], awayTeam: GROUPS['G'][2], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'G', round: 'Group Stage', status: 'upcoming' },
  { id: 40, date: '2026-06-22', time: '14:00', homeTeam: GROUPS['G'][3], awayTeam: GROUPS['G'][1], venue: 'AT&T Stadium', city: 'Dallas', country: 'USA', group: 'G', round: 'Group Stage', status: 'upcoming' },
  { id: 41, date: '2026-06-26', time: '20:00', homeTeam: GROUPS['G'][3], awayTeam: GROUPS['G'][0], venue: 'NRG Stadium', city: 'Houston', country: 'USA', group: 'G', round: 'Group Stage', status: 'upcoming' },
  { id: 42, date: '2026-06-26', time: '20:00', homeTeam: GROUPS['G'][1], awayTeam: GROUPS['G'][2], venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', group: 'G', round: 'Group Stage', status: 'upcoming' },

  // Group H
  { id: 43, date: '2026-06-19', time: '14:00', homeTeam: GROUPS['H'][0], awayTeam: GROUPS['H'][1], venue: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', group: 'H', round: 'Group Stage', status: 'upcoming' },
  { id: 44, date: '2026-06-19', time: '20:00', homeTeam: GROUPS['H'][2], awayTeam: GROUPS['H'][3], venue: 'BC Place', city: 'Vancouver', country: 'Canada', group: 'H', round: 'Group Stage', status: 'upcoming' },
  { id: 45, date: '2026-06-23', time: '14:00', homeTeam: GROUPS['H'][0], awayTeam: GROUPS['H'][2], venue: 'Hard Rock Stadium', city: 'Miami', country: 'USA', group: 'H', round: 'Group Stage', status: 'upcoming' },
  { id: 46, date: '2026-06-23', time: '20:00', homeTeam: GROUPS['H'][3], awayTeam: GROUPS['H'][1], venue: 'MetLife Stadium', city: 'New York', country: 'USA', group: 'H', round: 'Group Stage', status: 'upcoming' },
  { id: 47, date: '2026-06-27', time: '20:00', homeTeam: GROUPS['H'][3], awayTeam: GROUPS['H'][0], venue: 'Gillette Stadium', city: 'Boston', country: 'USA', group: 'H', round: 'Group Stage', status: 'upcoming' },
  { id: 48, date: '2026-06-27', time: '20:00', homeTeam: GROUPS['H'][1], awayTeam: GROUPS['H'][2], venue: 'BMO Field', city: 'Toronto', country: 'Canada', group: 'H', round: 'Group Stage', status: 'upcoming' },
];
