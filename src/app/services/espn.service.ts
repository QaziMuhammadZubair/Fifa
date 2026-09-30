import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timer, switchMap, shareReplay, map, catchError, of } from 'rxjs';
import {
  EspnScoreboardResponse, EspnCompetitor, LiveMatch, NormalizedTeam, EspnEvent
} from '../shared/models/espn.model';

/** Map ESPN country abbreviation → country flag emoji */
const FLAG_MAP: Record<string, string> = {
  ARG: '🇦🇷', AUS: '🇦🇺', BEL: '🇧🇪', BIH: '🇧🇦', BRA: '🇧🇷',
  CAN: '🇨🇦', CMR: '🇨🇲', CRC: '🇨🇷', CRO: '🇭🇷', DEN: '🇩🇰',
  ECU: '🇪🇨', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', FRA: '🇫🇷', GER: '🇩🇪',
  GHA: '🇬🇭', IRN: '🇮🇷', JPN: '🇯🇵', KOR: '🇰🇷', KSA: '🇸🇦',
  MAR: '🇲🇦', MEX: '🇲🇽', NED: '🇳🇱', POL: '🇵🇱', POR: '🇵🇹',
  QAT: '🇶🇦', SEN: '🇸🇳', SRB: '🇷🇸', SUI: '🇨🇭', TUN: '🇹🇳',
  URU: '🇺🇾', USA: '🇺🇸', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', SWE: '🇸🇪', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  NGA: '🇳🇬', EGY: '🇪🇬', ALG: '🇩🇿', TUR: '🇹🇷', SLO: '🇸🇮',
  SVN: '🇸🇮', SVK: '🇸🇰', AUT: '🇦🇹', CHE: '🇨🇭', GRE: '🇬🇷',
  PAN: '🇵🇦', COL: '🇨🇴', VEN: '🇻🇪', BOL: '🇧🇴', PAR: '🇵🇾',
  CHI: '🇨🇱', PER: '🇵🇪', HON: '🇭🇳', COS: '🇨🇷', JAM: '🇯🇲',
  TRI: '🇹🇹', HAI: '🇭🇹', CUB: '🇨🇺', IRI: '🇮🇷', IRQ: '🇮🇶',
  SYR: '🇸🇾', KUW: '🇰🇼', OMN: '🇴🇲', UAE: '🇦🇪', BHR: '🇧🇭',
  KGZ: '🇰🇬', UZB: '🇺🇿', TJK: '🇹🇯', KAZ: '🇰🇿', TKM: '🇹🇲',
  AZE: '🇦🇿', GEO: '🇬🇪', ARM: '🇦🇲', ALB: '🇦🇱', MKD: '🇲🇰',
  MON: '🇲🇪', SRB2: '🇷🇸', BUL: '🇧🇬', ROU: '🇷🇴', CZE: '🇨🇿',
  HUN: '🇭🇺', ISR: '🇮🇱', CIV: '🇨🇮', SEN2: '🇸🇳', MLI: '🇲🇱',
  GUI: '🇬🇳', BFA: '🇧🇫', TOG: '🇹🇬', CPV: '🇨🇻', GAB: '🇬🇦',
  GAM: '🇬🇲', SLE: '🇸🇱', LBR: '🇱🇷', GNB: '🇬🇼', CTA: '🇨🇫',
  COD: '🇨🇩', COG: '🇨🇬', RWA: '🇷🇼', BDI: '🇧🇮', TAN: '🇹🇿',
  MOZ: '🇲🇿', ZAM: '🇿🇲', ZIM: '🇿🇼', BOT: '🇧🇼', NAM: '🇳🇦',
  LES: '🇱🇸', SWZ: '🇸🇿', MAD: '🇲🇬', MRI: '🇲🇺', COM: '🇰🇲',
  MDV: '🇲🇻', NEP: '🇳🇵', SRI: '🇱🇰', BAN: '🇧🇩', PHI: '🇵🇭',
  THA: '🇹🇭', VIE: '🇻🇳', MYA: '🇲🇲', CAM: '🇰🇭', LAO: '🇱🇦',
  IND: '🇮🇳', PAK: '🇵🇰', AFG: '🇦🇫', CHN: '🇨🇳',
};

function getFlag(abbr: string): string {
  return FLAG_MAP[abbr.toUpperCase()] ?? '🏳️';
}

function normalizeTeam(c: EspnCompetitor): NormalizedTeam {
  return {
    id: c.team.id,
    name: c.team.displayName,
    abbr: c.team.abbreviation,
    logo: c.team.logo ?? '',
    flag: getFlag(c.team.abbreviation),
    color: '#' + (c.team.color ?? '334155'),
    form: c.form ?? '',
  };
}

function parseGroup(altGameNote?: string): string {
  if (!altGameNote) return '';
  const m = altGameNote.match(/Group\s+([A-Z0-9]+)/i);
  return m ? m[1] : '';
}

function parseRound(altGameNote?: string): string {
  if (!altGameNote) return 'Group Stage';
  if (/Round of 32/i.test(altGameNote)) return 'Round of 32';
  if (/Round of 16|Rd of 16/i.test(altGameNote)) return 'Round of 16';
  if (/Quarter/i.test(altGameNote)) return 'Quarter-Final';
  if (/Semi/i.test(altGameNote)) return 'Semi-Final';
  if (/Final/i.test(altGameNote)) return 'Final';
  return 'Group Stage';
}

function normalizeEvent(event: EspnEvent): LiveMatch | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  const homeCmp = comp.competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!;
  const awayCmp = comp.competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!;
  if (!homeCmp || !awayCmp) return null;

  const stType = comp.status.type;
  const broadcasts = comp.broadcasts?.flatMap((b: { market: string; names: string[] }) => b.names) ?? [];

  return {
    id:           event.id,
    date:         new Date(event.date),
    utcDateStr:   event.date,
    status:       stType.state as 'pre' | 'in' | 'post',
    statusLabel:  stType.shortDetail,
    displayClock: comp.status.displayClock,
    period:       comp.status.period ?? 0,
    completed:    stType.completed,
    homeTeam:     normalizeTeam(homeCmp),
    awayTeam:     normalizeTeam(awayCmp),
    homeScore:    parseInt(homeCmp.score ?? '0', 10),
    awayScore:    parseInt(awayCmp.score ?? '0', 10),
    venue:        comp.venue?.fullName ?? '',
    city:         comp.venue?.address?.city ?? '',
    group:        parseGroup(comp.altGameNote),
    round:        parseRound(comp.altGameNote),
    broadcasts,
    attendance:   comp.attendance,
  };
}

@Injectable({ providedIn: 'root' })
export class EspnService {
  private http = inject(HttpClient);

  // ESPN base URL (no API key required)
  private readonly BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';

  // Shared auto-refreshing stream – polls every 30 seconds
  private refresh$ = timer(0, 30_000);

  /** Today's scoreboard – live, refreshes every 30 s */
  readonly today$: Observable<LiveMatch[]> = this.refresh$.pipe(
    switchMap(() => this.fetchScoreboard()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Fetch scoreboard for a specific date (YYYYMMDD) or today */
  fetchScoreboard(dateStr?: string): Observable<LiveMatch[]> {
    let params = new HttpParams();
    if (dateStr) params = params.set('dates', dateStr);

    return this.http
      .get<EspnScoreboardResponse>(`${this.BASE}/scoreboard`, { params })
      .pipe(
        map(res => (res.events ?? []).map(normalizeEvent).filter((m): m is LiveMatch => m !== null) as LiveMatch[]),
        catchError(err => {
          console.error('ESPN API error', err);
          return of([] as LiveMatch[]);
        })
      );
  }

  /** Fetch a date range for the full schedule (e.g. 20260611–20260719) */
  fetchSchedule(fromDate: string, toDate: string): Observable<LiveMatch[]> {
    return this.http
      .get<EspnScoreboardResponse>(
        `${this.BASE}/scoreboard`,
        { params: new HttpParams().set('dates', `${fromDate}-${toDate}`) }
      )
      .pipe(
        map(res => (res.events ?? []).map(normalizeEvent).filter((m): m is LiveMatch => m !== null) as LiveMatch[]),
        catchError(() => of([] as LiveMatch[]))
      );
  }

  /** Convenience helpers */
  getLiveMatches(matches: LiveMatch[]): LiveMatch[] {
    return matches.filter(m => m.status === 'in');
  }

  getUpcomingMatches(matches: LiveMatch[]): LiveMatch[] {
    return matches.filter(m => m.status === 'pre').sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getFinishedMatches(matches: LiveMatch[]): LiveMatch[] {
    return matches.filter(m => m.status === 'post').sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
