import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GoogleAdComponent } from '../../shared/components/google-ad/google-ad.component';
import { EspnService } from '../../services/espn.service';
import { LiveMatch } from '../../shared/models/espn.model';

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, GoogleAdComponent],
  template: `
    <div class="page-wrapper">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
          <div class="hero-orb hero-orb-3"></div>
        </div>
        <div class="container hero-content animate-fadeInUp">
          <div class="hero-badge">
            <span class="badge badge-gold">🏆 The Greatest Show on Earth</span>
            @if (liveMatches().length > 0) {
              <span class="badge badge-live" style="margin-left:8px"><span class="live-dot"></span> {{ liveMatches().length }} Live Now</span>
            }
          </div>
          <h1 class="hero-title">FIFA World Cup<br/><span class="gold-text">2026™</span></h1>
          <p class="hero-sub">48 Nations · 104 Matches · USA • Canada • Mexico<br/>Live scores, free streams & real-time updates.</p>

          <!-- Countdown -->
          @if (!tournamentStarted()) {
            <div class="countdown">
              <div class="countdown-label">Tournament Starts In</div>
              <div class="countdown-grid">
                <div class="countdown-unit"><span class="countdown-num">{{ timeLeft().days }}</span><span class="countdown-text">Days</span></div>
                <div class="countdown-sep">:</div>
                <div class="countdown-unit"><span class="countdown-num">{{ timeLeft().hours }}</span><span class="countdown-text">Hours</span></div>
                <div class="countdown-sep">:</div>
                <div class="countdown-unit"><span class="countdown-num">{{ timeLeft().minutes }}</span><span class="countdown-text">Mins</span></div>
                <div class="countdown-sep">:</div>
                <div class="countdown-unit"><span class="countdown-num">{{ timeLeft().seconds }}</span><span class="countdown-text">Secs</span></div>
              </div>
            </div>
          } @else {
            <div class="countdown">
              <div class="countdown-label live-text" style="font-size:1.1rem; font-weight:700">🔴 Tournament is LIVE!</div>
            </div>
          }

          <div class="hero-actions">
            <a routerLink="/live" class="btn btn-live">
              <span class="live-dot-inline"></span> Watch Free
            </a>
            <a routerLink="/matches" class="btn btn-secondary">📅 Schedule</a>
            <a routerLink="/simulator" class="btn btn-secondary">🏆 Simulator</a>
          </div>
        </div>
      </section>

      <!-- Ad -->
      <div class="container" style="margin-top:16px">
        <app-google-ad format="banner"></app-google-ad>
      </div>

      <!-- Live / Today's Matches -->
      <section class="section">
        <div class="container">
          <h2 class="section-title">
            @if (liveMatches().length > 0) { 🔴 Live Right Now }
            @else { 📅 Today's Matches }
          </h2>

          @if (loading()) {
            <div class="loading-grid grid-2">
              @for (i of [1,2]; track i) {
                <div class="card skeleton-card">
                  <div class="skeleton" style="height:120px;border-radius:12px"></div>
                </div>
              }
            </div>
          } @else if (todayMatches().length === 0 && !loading()) {
            <div class="no-live card">
              <p>🌙 No matches scheduled today. Check the full schedule.</p>
              <a routerLink="/matches" class="btn btn-secondary btn-sm">View Schedule</a>
            </div>
          } @else {
            <div class="grid-2">
              @for (match of displayedMatches(); track match.id) {
                <div class="live-match-card card" [class.match-live]="match.status === 'in'" [class.match-done]="match.status === 'post'">
                  <div class="lmc-header">
                    @if (match.status === 'in') {
                      <span class="badge badge-live"><span class="live-dot"></span> {{ match.displayClock }}</span>
                    } @else if (match.status === 'post') {
                      <span class="badge badge-finished">FT</span>
                    } @else {
                      <span class="badge badge-upcoming">{{ formatTime(match.date) }}</span>
                    }
                    <div class="lmc-meta">
                      <span class="lmc-group">{{ match.group ? 'Group ' + match.group : match.round }}</span>
                      <span class="lmc-venue">{{ match.venue }}</span>
                    </div>
                  </div>

                  <div class="lmc-body">
                    <div class="team-display">
                      <div class="team-side">
                        <img [src]="match.homeTeam.logo" [alt]="match.homeTeam.name" class="team-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <span class="team-flag-fallback" style="display:none">{{ match.homeTeam.flag }}</span>
                        <span class="team-name">{{ match.homeTeam.name }}</span>
                      </div>
                      <div class="score-display" [class.live-score]="match.status === 'in'">
                        <span>{{ match.status !== 'pre' ? match.homeScore : '' }}</span>
                        <span class="score-vs">{{ match.status === 'pre' ? 'vs' : ':' }}</span>
                        <span>{{ match.status !== 'pre' ? match.awayScore : '' }}</span>
                      </div>
                      <div class="team-side right">
                        <img [src]="match.awayTeam.logo" [alt]="match.awayTeam.name" class="team-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                        <span class="team-flag-fallback" style="display:none">{{ match.awayTeam.flag }}</span>
                        <span class="team-name">{{ match.awayTeam.name }}</span>
                      </div>
                    </div>
                  </div>

                  @if (match.broadcasts.length > 0) {
                    <div class="lmc-broadcasts">
                      📺 {{ match.broadcasts.slice(0,3).join(' · ') }}
                    </div>
                  }

                  <div class="lmc-footer">
                    <a routerLink="/live" class="btn btn-live btn-sm">📺 Watch Free</a>
                    <span class="lmc-city">{{ match.city }}</span>
                  </div>
                </div>
              }
            </div>
            @if (todayMatches().length > 4) {
              <div style="text-align:center; margin-top:16px">
                <button class="btn btn-secondary btn-sm" (click)="toggleShowAll()">
                  {{ showAll() ? 'Show Less' : 'Show All ' + todayMatches().length + ' Matches' }}
                </button>
              </div>
            }
          }
        </div>
      </section>

      <!-- Stats Strip -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item"><span class="stat-num gold-text">48</span><span class="stat-label">Nations</span></div>
            <div class="stat-item"><span class="stat-num gold-text">104</span><span class="stat-label">Matches</span></div>
            <div class="stat-item"><span class="stat-num gold-text">16</span><span class="stat-label">Host Cities</span></div>
            <div class="stat-item"><span class="stat-num gold-text">3</span><span class="stat-label">Countries</span></div>
            <div class="stat-item"><span class="stat-num gold-text">39</span><span class="stat-label">Days</span></div>
          </div>
        </div>
      </section>

      <!-- Ad -->
      <div class="container"><app-google-ad format="rectangle"></app-google-ad></div>

      <!-- Live Data Bar -->
      <section class="section">
        <div class="container">
          <div class="live-data-bar card">
            <div class="ldb-item">
              <span class="ldb-icon">🔴</span>
              <div>
                <div class="ldb-label">Live Matches</div>
                <div class="ldb-val">{{ liveMatches().length }}</div>
              </div>
            </div>
            <div class="ldb-item">
              <span class="ldb-icon">⏰</span>
              <div>
                <div class="ldb-label">Upcoming Today</div>
                <div class="ldb-val">{{ upcomingToday().length }}</div>
              </div>
            </div>
            <div class="ldb-item">
              <span class="ldb-icon">✅</span>
              <div>
                <div class="ldb-label">Finished Today</div>
                <div class="ldb-val">{{ finishedToday().length }}</div>
              </div>
            </div>
            <div class="ldb-item">
              <span class="ldb-icon">🔄</span>
              <div>
                <div class="ldb-label">Auto Refresh</div>
                <div class="ldb-val" style="color:#27ae60">Every 30s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Simulator CTA -->
      <section class="section">
        <div class="container">
          <div class="sim-cta card">
            <div class="sim-cta-content">
              <h2>🏆 Free the Cup Simulator</h2>
              <p>Predict match scores, watch standings update live, then simulate the full knockout bracket to find your champion.</p>
              <a routerLink="/simulator" class="btn btn-primary">Start Predicting</a>
            </div>
            <div class="sim-cta-trophy animate-float">🏆</div>
          </div>
        </div>
      </section>

      <!-- Bottom Ad -->
      <div class="container" style="margin-bottom:48px">
        <app-google-ad format="leaderboard"></app-google-ad>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      min-height: 100vh; display: flex; align-items: center;
      position: relative; overflow: hidden; padding: 80px 0 60px;
    }
    .hero-bg { position: absolute; inset: 0; z-index: 0; }
    .hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
    .hero-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #1a4e8a, transparent); top: -100px; left: -100px; }
    .hero-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #d4af37, transparent); top: 20%; right: 5%; animation: float 6s ease-in-out infinite; }
    .hero-orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #1a6e3c, transparent); bottom: 0; left: 40%; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }

    .hero-content { position: relative; z-index: 1; text-align: center; }
    .hero-badge { margin-bottom: 24px; }
    .hero-title { font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
    .hero-sub { font-size: clamp(1rem, 2vw, 1.2rem); color: #8ca0c8; margin-bottom: 36px; line-height: 1.7; }

    .countdown { margin-bottom: 36px; }
    .countdown-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #8ca0c8; margin-bottom: 16px; }
    .countdown-grid { display: inline-flex; align-items: center; gap: 8px; }
    .countdown-unit {
      display: flex; flex-direction: column; align-items: center;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
      border-radius: 12px; padding: 16px 20px; min-width: 80px;
    }
    .countdown-num { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 900; color: #d4af37; line-height: 1; }
    .countdown-text { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #8ca0c8; margin-top: 4px; }
    .countdown-sep { font-size: 2rem; font-weight: 700; color: #d4af37; padding-bottom: 20px; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .live-dot-inline { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: pulse-dot 1.2s infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

    /* Match Cards */
    .match-live { border-color: rgba(231,76,60,0.35) !important; background: rgba(231,76,60,0.04) !important; }
    .match-done { border-color: rgba(255,255,255,0.08) !important; }
    .lmc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 8px; }
    .lmc-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .lmc-group { font-size: 0.78rem; color: #d4af37; font-weight: 600; }
    .lmc-venue { font-size: 0.72rem; color: #4a6080; }
    .lmc-body { margin-bottom: 12px; }
    .team-display { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .team-side { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .team-logo { width: 48px; height: 48px; object-fit: contain; }
    .team-flag-fallback { font-size: 2.5rem; }
    .team-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.85rem; text-align: center; color: #f0f4ff; line-height: 1.2; }
    .score-display { display: flex; align-items: center; gap: 8px; font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 900; color: #f0f4ff; min-width: 100px; justify-content: center; }
    .live-score { color: #e74c3c; }
    .score-vs { color: #4a6080; font-size: 1.2rem; }
    .lmc-broadcasts { font-size: 0.72rem; color: #8ca0c8; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.05); margin-bottom: 12px; }
    .lmc-footer { display: flex; align-items: center; justify-content: space-between; }
    .lmc-city { font-size: 0.75rem; color: #8ca0c8; }
    .no-live { text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .no-live p { color: #8ca0c8; }
    .loading-grid { }
    .skeleton-card { padding: 16px; }

    /* Stats */
    .stats-section {
      background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(39,174,96,0.04));
      border-top: 1px solid rgba(212,175,55,0.12); border-bottom: 1px solid rgba(212,175,55,0.12);
      padding: 40px 0; margin: 32px 0;
    }
    .stats-grid { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px; }
    .stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-num { font-family: 'Outfit', sans-serif; font-size: 3rem; font-weight: 900; line-height: 1; }
    .stat-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #8ca0c8; }

    /* Live Data Bar */
    .live-data-bar {
      display: flex; justify-content: space-around; align-items: center;
      flex-wrap: wrap; gap: 16px; padding: 24px 32px;
    }
    .ldb-item { display: flex; align-items: center; gap: 16px; }
    .ldb-icon { font-size: 2rem; }
    .ldb-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: #8ca0c8; }
    .ldb-val { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: #f0f4ff; }

    /* Simulator CTA */
    .sim-cta { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 48px; background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(255,255,255,0.02)); border-color: rgba(212,175,55,0.25) !important; }
    .sim-cta-content { flex: 1; }
    .sim-cta-content h2 { font-size: 2rem; margin-bottom: 12px; }
    .sim-cta-content p { margin-bottom: 24px; }
    .sim-cta-trophy { font-size: 6rem; flex-shrink: 0; animation: float 3s ease-in-out infinite; }

    @media (max-width: 768px) {
      .countdown-grid { gap: 4px; }
      .countdown-unit { min-width: 64px; padding: 12px; }
      .countdown-num { font-size: 1.8rem; }
      .sim-cta { flex-direction: column; text-align: center; padding: 32px 24px; }
      .sim-cta-trophy { font-size: 4rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private espn = inject(EspnService);
  private timer: any;
  private sub = new Subscription();

  timeLeft = signal<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  tournamentStarted = signal(false);
  loading = signal(true);
  todayMatches = signal<LiveMatch[]>([]);
  liveMatches = signal<LiveMatch[]>([]);
  upcomingToday = signal<LiveMatch[]>([]);
  finishedToday = signal<LiveMatch[]>([]);
  showAll = signal(false);

  displayedMatches = () => this.showAll() ? this.todayMatches() : this.todayMatches().slice(0, 4);

  ngOnInit() {
    this.updateCountdown();
    this.timer = setInterval(() => this.updateCountdown(), 1000);

    this.sub.add(
      this.espn.today$.subscribe(matches => {
        this.todayMatches.set(matches);
        this.liveMatches.set(this.espn.getLiveMatches(matches));
        this.upcomingToday.set(this.espn.getUpcomingMatches(matches));
        this.finishedToday.set(this.espn.getFinishedMatches(matches));
        this.loading.set(false);
      })
    );
  }

  toggleShowAll() { this.showAll.update(v => !v); }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.sub.unsubscribe();
  }

  private updateCountdown() {
    const target = new Date('2026-06-11T20:00:00-06:00').getTime();
    const diff = Date.now() - target;
    if (diff >= 0) {
      this.tournamentStarted.set(true);
      clearInterval(this.timer);
      return;
    }
    const abs = Math.abs(diff);
    this.timeLeft.set({
      days:    Math.floor(abs / 86400000),
      hours:   Math.floor((abs % 86400000) / 3600000),
      minutes: Math.floor((abs % 3600000) / 60000),
      seconds: Math.floor((abs % 60000) / 1000),
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  }
}
