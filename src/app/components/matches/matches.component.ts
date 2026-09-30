import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GoogleAdComponent } from '../../shared/components/google-ad/google-ad.component';
import { EspnService } from '../../services/espn.service';
import { LiveMatch } from '../../shared/models/espn.model';

type FilterStatus = 'all' | 'in' | 'pre' | 'post';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleAdComponent],
  template: `
    <div class="page-wrapper">
      <section class="section">
        <div class="container">
          <div class="page-header animate-fadeInUp">
            <div class="page-header-top">
              <h1>📅 Match Schedule</h1>
              <div class="live-indicator" *ngIf="liveCount() > 0">
                <span class="badge badge-live"><span class="live-dot"></span> {{ liveCount() }} Live</span>
              </div>
            </div>
            <p>Real-time FIFA World Cup 2026 results & fixtures · Auto-refreshes every 30s</p>
          </div>

          <!-- Ad -->
          <div style="margin-bottom:32px"><app-google-ad format="banner"></app-google-ad></div>

          <!-- Date Navigator -->
          <div class="date-nav card">
            <button class="btn btn-sm btn-secondary" (click)="changeDate(-1)">← Prev Day</button>
            <div class="date-display">
              <span class="date-label">{{ displayDate() }}</span>
              <span class="date-sub">{{ allMatches().length }} match{{ allMatches().length !== 1 ? 'es' : '' }} found</span>
            </div>
            <button class="btn btn-sm btn-secondary" (click)="changeDate(1)">Next Day →</button>
            <button class="btn btn-sm btn-primary" (click)="goToday()">Today</button>
          </div>

          <!-- Status Filter Tabs -->
          <div class="filters-bar">
            <div class="tabs">
              @for (opt of statusOpts; track opt.val) {
                <button class="tab-btn" [class.active]="filterStatus() === opt.val" (click)="filterStatus.set(opt.val)">
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>

          <!-- Loading -->
          @if (loading()) {
            <div class="loading-state card">
              <div class="spinner"></div>
              <p>Loading live match data…</p>
            </div>
          } @else if (filteredMatches().length === 0) {
            <div class="empty-state card">
              <span style="font-size:3rem">📭</span>
              <p>No matches found for this filter on {{ displayDate() }}.</p>
              <button class="btn btn-secondary btn-sm" (click)="filterStatus.set('all')">Show All</button>
            </div>
          } @else {
            <div class="matches-container card">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th colspan="2">Home</th>
                    <th style="text-align:center">Score</th>
                    <th colspan="2" style="text-align:right">Away</th>
                    <th class="hide-mobile">Venue</th>
                    <th class="hide-mobile">Round</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of filteredMatches(); track m.id) {
                    <tr [class.row-live]="m.status === 'in'">
                      <td class="time-col">
                        <div class="match-time-utc">{{ formatTime(m.date) }}</div>
                      </td>
                      <td><img [src]="m.homeTeam.logo" [alt]="m.homeTeam.abbr" class="team-logo-sm" onerror="this.textContent='⚽'; this.style.fontSize='1.2rem'"></td>
                      <td class="team-name-col">{{ m.homeTeam.name }}</td>
                      <td style="text-align:center">
                        @if (m.status !== 'pre') {
                          <span class="score-badge" [class.live-score]="m.status === 'in'">{{ m.homeScore }} – {{ m.awayScore }}</span>
                        } @else {
                          <span class="vs-badge">vs</span>
                        }
                      </td>
                      <td class="team-name-col" style="text-align:right">{{ m.awayTeam.name }}</td>
                      <td><img [src]="m.awayTeam.logo" [alt]="m.awayTeam.abbr" class="team-logo-sm" onerror="this.textContent='⚽'; this.style.fontSize='1.2rem'"></td>
                      <td class="hide-mobile">
                        <div class="venue-cell">
                          <span>{{ m.venue }}</span>
                          <span class="venue-city">{{ m.city }}</span>
                        </div>
                      </td>
                      <td class="hide-mobile">
                        <span class="round-badge">{{ m.group ? 'Grp ' + m.group : m.round }}</span>
                      </td>
                      <td>
                        @if (m.status === 'in') {
                          <span class="badge badge-live"><span class="live-dot"></span> {{ m.displayClock }}</span>
                        } @else if (m.status === 'post') {
                          <span class="badge badge-finished">FT</span>
                        } @else {
                          <span class="badge badge-upcoming">Soon</span>
                        }
                      </td>
                      <td>
                        @if (m.status === 'in') {
                          <a routerLink="/live" class="btn btn-live btn-sm">📺</a>
                        } @else if (m.status === 'pre') {
                          <a routerLink="/live" class="btn btn-sm btn-secondary">🔔</a>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Refresh note -->
          <div class="refresh-note">
            🔄 Data auto-refreshes every 30 seconds from ESPN · Last check: {{ lastRefreshLabel() }}
          </div>

          <div style="margin-top:32px"><app-google-ad format="leaderboard"></app-google-ad></div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    .page-header-top { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    .page-header-top h1 { margin: 0; }

    .date-nav {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 20px; flex-wrap: wrap;
      padding: 16px 20px;
    }
    .date-display { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .date-label { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; color: #f0f4ff; }
    .date-sub { font-size: 0.78rem; color: #8ca0c8; }

    .filters-bar { margin-bottom: 20px; }
    .matches-container { padding: 0; overflow: hidden; }

    .time-col { white-space: nowrap; }
    .match-time-utc { font-size: 0.82rem; font-weight: 600; color: #d4af37; }

    .team-logo-sm { width: 28px; height: 28px; object-fit: contain; }
    .team-name-col { font-weight: 600; font-size: 0.9rem; }
    .score-badge { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1.05rem; color: #f0f4ff; background: rgba(255,255,255,0.08); padding: 4px 12px; border-radius: 6px; white-space: nowrap; }
    .live-score { color: #e74c3c; background: rgba(231,76,60,0.12); }
    .vs-badge { color: #4a6080; font-size: 0.85rem; }
    .venue-cell { display: flex; flex-direction: column; }
    .venue-cell span:first-child { font-size: 0.82rem; color: #f0f4ff; }
    .venue-city { font-size: 0.72rem; color: #8ca0c8; }
    .round-badge { font-size: 0.72rem; color: #8ca0c8; background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 4px; }
    .row-live { background: rgba(231,76,60,0.04); }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px; text-align: center; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { padding: 48px; text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center; }
    .empty-state p { color: #8ca0c8; }
    .refresh-note { font-size: 0.75rem; color: #4a6080; text-align: center; margin-top: 12px; }
  `]
})
export class MatchesComponent implements OnInit, OnDestroy {
  private espn = inject(EspnService);
  private sub = new Subscription();

  statusOpts = [
    { label: 'All', val: 'all' as FilterStatus },
    { label: '🔴 Live', val: 'in' as FilterStatus },
    { label: '⏰ Upcoming', val: 'pre' as FilterStatus },
    { label: '✅ Finished', val: 'post' as FilterStatus },
  ];

  allMatches = signal<LiveMatch[]>([]);
  filteredMatches = signal<LiveMatch[]>([]);
  filterStatus = signal<FilterStatus>('all');
  liveCount = signal(0);
  loading = signal(true);

  private currentDate = new Date();
  displayDate = signal('');
  lastRefresh = signal(new Date());
  lastRefreshLabel = signal('just now');

  ngOnInit() {
    this.setDate(new Date());
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  private setDate(date: Date) {
    this.currentDate = date;
    this.displayDate.set(date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    this.loading.set(true);
    this.sub.unsubscribe();

    const dateStr = this.toDateStr(date);

    // For today use the shared auto-refresh stream, otherwise fetch once
    const isToday = dateStr === this.toDateStr(new Date());
    const stream$ = isToday
      ? this.espn.today$
      : this.espn.fetchScoreboard(dateStr);

    this.sub = new Subscription();
    this.sub.add(stream$.subscribe(matches => {
      this.allMatches.set(matches);
      this.liveCount.set(matches.filter(m => m.status === 'in').length);
      this.applyFilter();
      this.loading.set(false);
      this.lastRefresh.set(new Date());
      this.updateRefreshLabel();
    }));
  }

  private applyFilter() {
    const all = this.allMatches();
    const f = this.filterStatus();
    this.filteredMatches.set(f === 'all' ? all : all.filter(m => m.status === f));
  }

  // Watch filter changes
  ngDoCheck() { this.applyFilter(); }

  changeDate(delta: number) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.setDate(d);
  }

  goToday() { this.setDate(new Date()); }

  private toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private updateRefreshLabel() {
    const diff = Math.floor((Date.now() - this.lastRefresh().getTime()) / 1000);
    this.lastRefreshLabel.set(diff < 5 ? 'just now' : `${diff}s ago`);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
  }
}
