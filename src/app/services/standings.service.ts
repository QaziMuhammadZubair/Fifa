import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface StandingTeam {
  id: string;
  name: string;
  abbr: string;
  logo: string;
}

export interface StandingEntry {
  rank: number;
  team: StandingTeam;
  gp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  advanced: boolean;
}

export interface GroupStanding {
  groupName: string;
  groupLetter: string;
  entries: StandingEntry[];
}

export interface EspnStandingsResponse {
  children: Array<{
    id: string;
    name: string;
    abbreviation: string;
    standings: {
      entries: Array<{
        team: {
          id: string;
          displayName: string;
          abbreviation: string;
          logos: Array<{ href: string }>;
        };
        note?: { description: string };
        stats: Array<{ name: string; value: number; displayValue: string }>;
      }>;
    };
  }>;
}

function getStat(stats: Array<{ name: string; value: number }>, name: string): number {
  return stats.find(s => s.name === name)?.value ?? 0;
}

@Injectable({ providedIn: 'root' })
export class StandingsService {
  private http = inject(HttpClient);

  private readonly STANDINGS_URL =
    'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings';

  getStandings(): Observable<GroupStanding[]> {
    return this.http.get<EspnStandingsResponse>(this.STANDINGS_URL).pipe(
      map(res => {
        if (!res?.children) return [];

        return res.children.map(group => {
          const letter = group.abbreviation?.replace('Group ', '') ?? '?';

          const entries: StandingEntry[] = (group.standings?.entries ?? [])
            .map(e => {
              const stats = e.stats ?? [];
              const rank = getStat(stats, 'rank');
              return {
                rank,
                team: {
                  id: e.team.id,
                  name: e.team.displayName,
                  abbr: e.team.abbreviation,
                  logo: e.team.logos?.[0]?.href ?? '',
                },
                gp: getStat(stats, 'gamesPlayed'),
                w: getStat(stats, 'wins'),
                d: getStat(stats, 'ties'),
                l: getStat(stats, 'losses'),
                gf: getStat(stats, 'pointsFor'),
                ga: getStat(stats, 'pointsAgainst'),
                gd: getStat(stats, 'pointDifferential'),
                pts: getStat(stats, 'points'),
                advanced: getStat(stats, 'advanced') === 1,
              } as StandingEntry;
            })
            .sort((a, b) => a.rank - b.rank);

          return {
            groupName: group.name,
            groupLetter: letter,
            entries,
          };
        });
      }),
      catchError(err => {
        console.error('Standings API error', err);
        return of([] as GroupStanding[]);
      })
    );
  }
}
