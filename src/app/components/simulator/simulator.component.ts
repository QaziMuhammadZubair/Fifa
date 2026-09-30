import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { GoogleAdComponent } from '../../shared/components/google-ad/google-ad.component';
import { EspnService } from '../../services/espn.service';
import { StandingsService, GroupStanding } from '../../services/standings.service';
import { LiveMatch } from '../../shared/models/espn.model';

type TabKey = 'standings' | 'results' | 'upcoming';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, GoogleAdComponent],
  template: `
    <div class="page-wrapper">
      <section class="section">
        <div class="container">

          <!-- Header -->
          <div class="page-header animate-fadeInUp">
            <div class="page-header-top">
              <h1>🏆 Live Standings & Results</h1>
              <span class="badge badge-live" style="font-size:0.72rem"><span class="live-dot"></span> Real-Time Data</span>
            </div>
            <p>Official FIFA World Cup 2026 standings, live scores & completed results — auto-refreshes every 30s</p>
            @if (lastUpdated()) {
              <div class="last-updated">🔄 Last updated: {{ lastUpdated() }}</div>
            }
          </div>

          <div style="margin-bottom:24px"><app-google-ad format="banner"></app-google-ad></div>

          <!-- Global Tabs -->
          <div class="tabs" style="margin-bottom:28px">
            <button class="tab-btn" [class.active]="activeTab() === 'standings'" (click)="activeTab.set('standings')">📊 Group Standings</button>
            <button class="tab-btn" [class.active]="activeTab() === 'results'" (click)="activeTab.set('results')">✅ Match Results</button>
            <button class="tab-btn" [class.active]="activeTab() === 'upcoming'" (click)="activeTab.set('upcoming')">⏰ Upcoming</button>
          </div>

          <!-- ── STANDINGS TAB ── -->
          @if (activeTab() === 'standings') {
            @if (standingsLoading()) {
              <div class="loading-state card">
                <div class="spinner"></div>
                <p>Loading real-time standings…</p>
              </div>
            } @else if (standings().length === 0) {
              <div class="empty-state card">
                <p>No standings data available yet. Check back when group stage matches begin.</p>
              </div>
            } @else {
              <!-- Group Filter -->
              <div class="group-filter">
                <button class="group-pill" [class.active]="selectedGroup() === null" (click)="selectedGroup.set(null)">All Groups</button>
                @for (g of standings(); track g.groupLetter) {
                  <button class="group-pill" [class.active]="selectedGroup() === g.groupLetter" (click)="selectedGroup.set(g.groupLetter)">
                    Grp {{ g.groupLetter }}
                  </button>
                }
              </div>

              <div class="groups-grid">
                @for (group of filteredStandings(); track group.groupLetter) {
                  <div class="group-card card">
                    <div class="group-card-header">
                      <span class="group-badge">Group {{ group.groupLetter }}</span>
                      <span class="group-count">{{ group.entries.length }} teams</span>
                    </div>

                    <table class="standings-table">
                      <thead>
                        <tr>
                          <th class="pos-col">#</th>
                          <th>Team</th>
                          <th title="Matches Played">GP</th>
                          <th title="Wins">W</th>
                          <th title="Draws">D</th>
                          <th title="Losses">L</th>
                          <th title="Goals For">GF</th>
                          <th title="Goals Against">GA</th>
                          <th title="Goal Difference">GD</th>
                          <th title="Points" class="pts-col">P</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (entry of group.entries; track entry.team.id) {
                          <tr [class.advancing]="entry.advanced" [class.row-top]="entry.rank <= 2">
                            <td class="pos-col">
                              <span class="rank-badge" [class.rank-1]="entry.rank === 1" [class.rank-2]="entry.rank === 2">
                                {{ entry.rank }}
                              </span>
                            </td>
                            <td class="team-cell">
                              <img [src]="entry.team.logo" [alt]="entry.team.abbr" class="team-logo-sm" onerror="this.style.visibility='hidden'">
                              <span class="team-name-st">{{ entry.team.name }}</span>
                              @if (entry.advanced) { <span class="adv-dot" title="Advanced">●</span> }
                            </td>
                            <td>{{ entry.gp }}</td>
                            <td>{{ entry.w }}</td>
                            <td>{{ entry.d }}</td>
                            <td>{{ entry.l }}</td>
                            <td>{{ entry.gf }}</td>
                            <td>{{ entry.ga }}</td>
                            <td [class.gd-pos]="entry.gd > 0" [class.gd-neg]="entry.gd < 0">
                              {{ entry.gd > 0 ? '+' : '' }}{{ entry.gd }}
                            </td>
                            <td class="pts-col">
                              <strong class="pts-val">{{ entry.pts }}</strong>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>

                    <div class="group-card-legend">
                      <span class="legend-dot adv"></span><span>Advancing to Round of 32</span>
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- ── RESULTS TAB ── -->
          @if (activeTab() === 'results') {
            @if (resultsLoading()) {
              <div class="loading-state card">
                <div class="spinner"></div>
                <p>Loading match results…</p>
              </div>
            } @else if (finishedMatches().length === 0) {
              <div class="empty-state card">
                <p>No completed matches yet.</p>
              </div>
            } @else {
              <div class="results-list">
                @for (m of finishedMatches(); track m.id) {
                  <div class="result-card card">
                    <div class="rc-meta">
                      <span class="rc-group">{{ m.group ? 'Group ' + m.group : m.round }}</span>
                      <span class="badge badge-finished">FT</span>
                      <span class="rc-date">{{ formatDate(m.date) }}</span>
                    </div>
                    <div class="rc-match">
                      <div class="rc-team" [class.rc-winner]="m.homeScore > m.awayScore">
                        <img [src]="m.homeTeam.logo" [alt]="m.homeTeam.abbr" class="rc-logo">
                        <span>{{ m.homeTeam.name }}</span>
                        <span class="rc-abbr">{{ m.homeTeam.abbr }}</span>
                      </div>
                      <div class="rc-score" [class.draw]="m.homeScore === m.awayScore">
                        <span class="rc-score-home" [class.score-hi]="m.homeScore > m.awayScore">{{ m.homeScore }}</span>
                        <span class="rc-score-sep">–</span>
                        <span class="rc-score-away" [class.score-hi]="m.awayScore > m.homeScore">{{ m.awayScore }}</span>
                      </div>
                      <div class="rc-team right" [class.rc-winner]="m.awayScore > m.homeScore">
                        <span class="rc-abbr">{{ m.awayTeam.abbr }}</span>
                        <span>{{ m.awayTeam.name }}</span>
                        <img [src]="m.awayTeam.logo" [alt]="m.awayTeam.abbr" class="rc-logo">
                      </div>
                    </div>
                    <div class="rc-footer">
                      <span>📍 {{ m.venue }}, {{ m.city }}</span>
                      @if (m.broadcasts.length > 0) {
                        <span>📺 {{ m.broadcasts.slice(0,2).join(' · ') }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- ── UPCOMING TAB ── -->
          @if (activeTab() === 'upcoming') {
            @if (upcomingLoading()) {
              <div class="loading-state card">
                <div class="spinner"></div>
                <p>Loading upcoming fixtures…</p>
              </div>
            } @else if (upcomingMatches().length === 0) {
              <div class="empty-state card">
                <p>No upcoming group stage matches scheduled.</p>
              </div>
            } @else {
              <div class="results-list">
                @for (m of upcomingMatches(); track m.id) {
                  <div class="result-card card upcoming-card">
                    <div class="rc-meta">
                      <span class="rc-group">{{ m.group ? 'Group ' + m.group : m.round }}</span>
                      @if (m.status === 'in') {
                        <span class="badge badge-live" style="font-size:0.7rem"><span class="live-dot"></span> {{ m.displayClock }}</span>
                      } @else {
                        <span class="badge badge-upcoming">{{ formatTime(m.date) }}</span>
                      }
                      <span class="rc-date">{{ formatDate(m.date) }}</span>
                    </div>
                    <div class="rc-match">
                      <div class="rc-team">
                        <img [src]="m.homeTeam.logo" [alt]="m.homeTeam.abbr" class="rc-logo">
                        <span>{{ m.homeTeam.name }}</span>
                      </div>
                      <div class="rc-score upcoming-vs">
                        @if (m.status === 'in') {
                          <span class="live-score-inline">{{ m.homeScore }} – {{ m.awayScore }}</span>
                        } @else {
                          <span style="color:#4a6080; font-size:1.1rem">vs</span>
                        }
                      </div>
                      <div class="rc-team right">
                        <span>{{ m.awayTeam.name }}</span>
                        <img [src]="m.awayTeam.logo" [alt]="m.awayTeam.abbr" class="rc-logo">
                      </div>
                    </div>
                    <div class="rc-footer">
                      <span>📍 {{ m.venue }}, {{ m.city }}</span>
                      @if (m.broadcasts.length > 0) {
                        <span>📺 {{ m.broadcasts.slice(0,2).join(' · ') }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- Live matches banner -->
          @if (liveNow().length > 0) {
            <div class="live-banner card">
              <div class="live-banner-title"><span class="live-dot"></span> LIVE NOW — {{ liveNow().length }} match{{ liveNow().length > 1 ? 'es' : '' }} in progress</div>
              <div class="live-banner-matches">
                @for (m of liveNow(); track m.id) {
                  <div class="live-mini">
                    <span class="lm-name">{{ m.homeTeam.abbr }}</span>
                    <span class="lm-score">{{ m.homeScore }}–{{ m.awayScore }}</span>
                    <span class="lm-name">{{ m.awayTeam.abbr }}</span>
                    <span class="lm-clock">{{ m.displayClock }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <div style="margin-top:32px"><app-google-ad format="leaderboard"></app-google-ad></div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    .page-header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .page-header-top h1 { margin: 0; }
    .last-updated { font-size: 0.75rem; color: #4a6080; margin-top: 4px; }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px; text-align: center; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { padding: 40px; text-align: center; }
    .empty-state p { color: #8ca0c8; }

    /* Group Filter */
    .group-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .group-pill { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 999px; padding: 6px 14px; font-size: 0.8rem; font-weight: 600; color: #8ca0c8; cursor: pointer; transition: all 0.2s; }
    .group-pill:hover { background: rgba(255,255,255,0.10); color: #f0f4ff; }
    .group-pill.active { background: rgba(212,175,55,0.18); border-color: rgba(212,175,55,0.4); color: #d4af37; }

    /* Groups Grid */
    .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(480px, 1fr)); gap: 24px; }
    .group-card { padding: 0; overflow: hidden; }
    .group-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(212,175,55,0.05); border-bottom: 1px solid rgba(212,175,55,0.12); }
    .group-badge { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 800; color: #d4af37; letter-spacing: 0.5px; }
    .group-count { font-size: 0.72rem; color: #4a6080; }

    /* Standings Table */
    .standings-table { width: 100%; border-collapse: collapse; }
    .standings-table th { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.8px; color: #4a6080; padding: 8px 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .standings-table td { padding: 10px 10px; text-align: center; font-size: 0.85rem; color: #8ca0c8; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
    .standings-table tbody tr:hover td { background: rgba(255,255,255,0.03); }
    .standings-table tbody tr:last-child td { border-bottom: none; }
    .pos-col { width: 36px; }
    .pts-col { width: 44px; }

    .rank-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 0.8rem; font-weight: 700; background: rgba(255,255,255,0.05); color: #8ca0c8; }
    .rank-1 { background: rgba(212,175,55,0.25); color: #d4af37; }
    .rank-2 { background: rgba(192,192,192,0.15); color: #c0c0c0; }

    .team-cell { display: flex; align-items: center; gap: 10px; text-align: left !important; }
    .team-logo-sm { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
    .team-name-st { font-weight: 600; color: #f0f4ff; font-size: 0.88rem; }
    .adv-dot { color: #27ae60; font-size: 0.6rem; margin-left: 4px; }

    .advancing td { background: rgba(39,174,96,0.03); }
    .row-top .team-name-st { color: #f0f4ff; }
    .pts-val { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 800; color: #d4af37; }
    .gd-pos { color: #27ae60 !important; font-weight: 600; }
    .gd-neg { color: #e74c3c !important; font-weight: 600; }

    .group-card-legend { padding: 10px 20px; display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #4a6080; border-top: 1px solid rgba(255,255,255,0.05); }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .legend-dot.adv { background: #27ae60; }

    /* Results / Upcoming Cards */
    .results-list { display: flex; flex-direction: column; gap: 16px; }
    .result-card { padding: 16px 20px; }
    .upcoming-card { background: rgba(255,255,255,0.02) !important; border-style: dashed !important; }
    .rc-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
    .rc-group { font-size: 0.72rem; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: 0.5px; }
    .rc-date { font-size: 0.72rem; color: #4a6080; margin-left: auto; }

    .rc-match { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
    .rc-team { display: flex; align-items: center; gap: 10px; flex: 1; }
    .rc-team.right { justify-content: flex-end; }
    .rc-logo { width: 36px; height: 36px; object-fit: contain; }
    .rc-team span { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; color: #f0f4ff; }
    .rc-abbr { font-size: 0.72rem !important; color: #4a6080 !important; font-weight: 600 !important; }
    .rc-winner span { color: #f0f4ff; }

    .rc-score { display: flex; align-items: center; gap: 8px; min-width: 90px; justify-content: center; }
    .rc-score-home, .rc-score-away { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; color: #8ca0c8; min-width: 28px; text-align: center; }
    .score-hi { color: #f0f4ff; }
    .rc-score-sep { color: #4a6080; font-size: 1.2rem; }
    .draw .rc-score-home, .draw .rc-score-away { color: #d4af37; }

    .upcoming-vs { min-width: 60px; }
    .live-score-inline { font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 900; color: #e74c3c; }

    .rc-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #4a6080; flex-wrap: wrap; gap: 8px; }

    /* Live Banner */
    .live-banner { margin-top: 32px; background: rgba(231,76,60,0.06) !important; border-color: rgba(231,76,60,0.25) !important; padding: 16px 20px; }
    .live-banner-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; color: #e74c3c; margin-bottom: 12px; }
    .live-banner-matches { display: flex; flex-wrap: wrap; gap: 16px; }
    .live-mini { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(231,76,60,0.20); border-radius: 8px; padding: 8px 14px; }
    .lm-name { font-weight: 700; font-size: 0.82rem; color: #f0f4ff; }
    .lm-score { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1rem; color: #e74c3c; }
    .lm-clock { font-size: 0.7rem; color: #e74c3c; background: rgba(231,76,60,0.12); padding: 2px 6px; border-radius: 4px; }

    @media (max-width: 768px) {
      .groups-grid { grid-template-columns: 1fr; }
      .rc-match { flex-wrap: wrap; justify-content: center; }
      .rc-team { flex: none; width: 100%; justify-content: center; }
      .rc-team.right { justify-content: center; }
    }
  `]
})
export class SimulatorComponent implements OnInit, OnDestroy {
  private espn = inject(EspnService);
  private standingsSvc = inject(StandingsService);
  private sub = new Subscription();

  activeTab = signal<TabKey>('standings');
  selectedGroup = signal<string | null>(null);

  standings = signal<GroupStanding[]>([]);
  standingsLoading = signal(true);

  finishedMatches = signal<LiveMatch[]>([]);
  upcomingMatches = signal<LiveMatch[]>([]);
  liveNow = signal<LiveMatch[]>([]);
  resultsLoading = signal(true);
  upcomingLoading = signal(true);

  lastUpdated = signal('');

  filteredStandings = () => {
    const g = this.selectedGroup();
    return g ? this.standings().filter(s => s.groupLetter === g) : this.standings();
  };

  ngOnInit() {
    // Load standings
    this.sub.add(this.standingsSvc.getStandings().subscribe(s => {
      this.standings.set(s);
      this.standingsLoading.set(false);
      this.lastUpdated.set(new Date().toLocaleTimeString());
    }));

    // Load all group stage matches (June 11 - June 27)
    this.sub.add(this.espn.fetchSchedule('20260611', '20260627').subscribe(matches => {
      this.finishedMatches.set(
        matches.filter(m => m.status === 'post')
               .sort((a, b) => b.date.getTime() - a.date.getTime())
      );
      this.upcomingMatches.set(
        matches.filter(m => m.status === 'pre' || m.status === 'in')
               .sort((a, b) => a.date.getTime() - b.date.getTime())
      );
      this.liveNow.set(matches.filter(m => m.status === 'in'));
      this.resultsLoading.set(false);
      this.upcomingLoading.set(false);
    }));

    // Today's live matches – auto-refreshing
    this.sub.add(this.espn.today$.subscribe(matches => {
      this.liveNow.set(matches.filter(m => m.status === 'in'));
      this.lastUpdated.set(new Date().toLocaleTimeString());
    }));

    // Refresh standings every 30s
    this.sub.add(
      timer(30_000, 30_000).subscribe(() => {
        this.standingsSvc.getStandings().subscribe(s => {
          if (s.length > 0) {
            this.standings.set(s);
            this.lastUpdated.set(new Date().toLocaleTimeString());
          }
        });
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
  }
}
