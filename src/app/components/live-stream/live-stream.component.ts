import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';
import { GoogleAdComponent } from '../../shared/components/google-ad/google-ad.component';
import { EspnService } from '../../services/espn.service';
import { LiveMatch } from '../../shared/models/espn.model';

interface StreamSource { id: string; label: string; url: string; quality: string; lang: string; external?: boolean; }

// YouTube embed URL builder
function ytEmbed(channelId: string): string {
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0`;
}

// Broadcast → Stream sources mapping
const BROADCAST_STREAMS: Record<string, StreamSource[]> = {
  default: [
    { id: 'fifaplus', label: '🔴 FIFA+ Official', url: 'https://www.youtube.com/embed/live_stream?channel=UCpcTrCXblq78GZrTUTLWeBw&autoplay=1', quality: 'HD', lang: 'EN' },
    { id: 'streameast', label: '⚡ StreamsEast', url: 'https://streamseast.is/', quality: 'HD 1080p', lang: 'EN', external: true },
    { id: 'espn', label: '📡 ESPN Live', url: 'https://www.youtube.com/embed/live_stream?channel=UCiWLfSweyRNmLpgEHekhoAg&autoplay=1', quality: 'HD', lang: 'EN' },
    { id: 'tele', label: '📺 Telemundo Dep.', url: 'https://www.youtube.com/embed/live_stream?channel=UCUrWM-tY0vLWz4qGRD0EZTQ&autoplay=1', quality: 'HD', lang: 'ES' },
    { id: 'fox', label: '🦊 FOX Sports', url: 'https://www.youtube.com/embed/live_stream?channel=UCUQ8UVxMkfnHECMG8fxp4MA&autoplay=1', quality: 'HD', lang: 'EN' },
  ],
};

@Component({
  selector: 'app-live-stream',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, GoogleAdComponent],
  template: `
    <div class="page-wrapper">
      <section class="section">
        <div class="container">
          <!-- Header -->
          <div class="live-header animate-fadeInUp">
            <div class="live-header-top">
              <h1>🔴 Free Live Streams</h1>
              @if (liveMatches().length > 0) {
                <span class="badge badge-live"><span class="live-dot"></span> {{ liveMatches().length }} Live Now</span>
              } @else {
                <span class="badge badge-upcoming">0 Live – Check upcoming</span>
              }
            </div>
            <p>Real-time FIFA World Cup 2026 streams. Select any match and pick your preferred source. Auto-refreshes every 30s.</p>
          </div>

          <!-- Top Ad -->
          <div style="margin-bottom:32px"><app-google-ad format="leaderboard"></app-google-ad></div>

          <!-- Disclaimer -->
          <div class="disclaimer-bar">
            <span>⚠️</span>
            <p>Streams are embedded from official free broadcasters (FIFA+, ESPN, Fox Sports, Telemundo). We do not host content. If a stream is offline, try a different source.</p>
          </div>

          <!-- Main Layout -->
          <div class="stream-layout">

            <!-- Match List -->
            <aside class="match-list-panel">
              <div class="panel-section">
                <div class="panel-title">🔴 Live Now</div>
                @if (liveMatches().length === 0 && !loading()) {
                  <div class="no-matches-panel">No live matches at the moment</div>
                }
                @for (m of liveMatches(); track m.id) {
                  <div class="match-item" [class.selected]="selectedMatch()?.id === m.id" (click)="selectMatch(m)">
                    <div class="match-item-header">
                      <span class="badge badge-live" style="font-size:0.65rem"><span class="live-dot"></span> {{ m.displayClock }}</span>
                      <span class="mi-group">{{ m.group ? 'Grp ' + m.group : m.round }}</span>
                    </div>
                    <div class="match-item-teams">
                      <div class="mi-team"><img [src]="m.homeTeam.logo" class="mi-logo"> {{ m.homeTeam.name }}</div>
                      <div class="mi-score">{{ m.homeScore }} – {{ m.awayScore }}</div>
                      <div class="mi-team"><img [src]="m.awayTeam.logo" class="mi-logo"> {{ m.awayTeam.name }}</div>
                    </div>
                    <div class="match-item-meta">{{ m.venue }} · {{ m.city }}</div>
                    @if (m.broadcasts.length > 0) {
                      <div class="mi-broadcasts">📺 {{ m.broadcasts.slice(0,3).join(' · ') }}</div>
                    }
                  </div>
                }
              </div>

              <div class="panel-section">
                <div class="panel-title">⏰ Upcoming Today</div>
                @if (upcomingMatches().length === 0 && !loading()) {
                  <div class="no-matches-panel">No more matches today</div>
                }
                @for (m of upcomingMatches(); track m.id) {
                  <div class="match-item" [class.selected]="selectedMatch()?.id === m.id" (click)="selectMatch(m)">
                    <div class="match-item-header">
                      <span class="badge badge-upcoming" style="font-size:0.65rem">Starts {{ formatTime(m.date) }}</span>
                      <span class="mi-group">{{ m.group ? 'Grp ' + m.group : m.round }}</span>
                    </div>
                    <div class="match-item-teams">
                      <div class="mi-team"><img [src]="m.homeTeam.logo" class="mi-logo"> {{ m.homeTeam.name }}</div>
                      <div class="mi-score" style="color:#4a6080">vs</div>
                      <div class="mi-team"><img [src]="m.awayTeam.logo" class="mi-logo"> {{ m.awayTeam.name }}</div>
                    </div>
                    <div class="match-item-meta">{{ m.venue }}</div>
                    @if (m.broadcasts.length > 0) {
                      <div class="mi-broadcasts">📺 {{ m.broadcasts.slice(0,3).join(' · ') }}</div>
                    }
                  </div>
                }
              </div>

              <div class="panel-section">
                <div class="panel-title">✅ Finished Today</div>
                @for (m of finishedMatches(); track m.id) {
                  <div class="match-item match-item-done" [class.selected]="selectedMatch()?.id === m.id" (click)="selectMatch(m)">
                    <div class="match-item-header">
                      <span class="badge badge-finished" style="font-size:0.65rem">FT</span>
                      <span class="mi-group">{{ m.group ? 'Grp ' + m.group : m.round }}</span>
                    </div>
                    <div class="match-item-teams">
                      <div class="mi-team" [class.winner]="m.homeScore > m.awayScore"><img [src]="m.homeTeam.logo" class="mi-logo"> {{ m.homeTeam.name }}</div>
                      <div class="mi-score">{{ m.homeScore }} – {{ m.awayScore }}</div>
                      <div class="mi-team" [class.winner]="m.awayScore > m.homeScore"><img [src]="m.awayTeam.logo" class="mi-logo"> {{ m.awayTeam.name }}</div>
                    </div>
                  </div>
                }
              </div>
            </aside>

            <!-- Player Panel -->
            <div class="player-panel">
              @if (selectedMatch()) {
                <!-- Match Info -->
                <div class="player-header">
                  <div class="player-match-teams">
                    <div class="ph-team">
                      <img [src]="selectedMatch()!.homeTeam.logo" class="ph-logo">
                      <span>{{ selectedMatch()!.homeTeam.name }}</span>
                    </div>
                    <div class="ph-score" [class.live-score]="selectedMatch()!.status === 'in'">
                      @if (selectedMatch()!.status !== 'pre') {
                        {{ selectedMatch()!.homeScore }} – {{ selectedMatch()!.awayScore }}
                      } @else {
                        vs
                      }
                    </div>
                    <div class="ph-team right">
                      <span>{{ selectedMatch()!.awayTeam.name }}</span>
                      <img [src]="selectedMatch()!.awayTeam.logo" class="ph-logo">
                    </div>
                  </div>
                  <div class="player-meta-row">
                    <span>{{ selectedMatch()!.group ? 'Group ' + selectedMatch()!.group : selectedMatch()!.round }}</span>
                    <span>·</span>
                    <span>{{ selectedMatch()!.venue }}</span>
                    @if (selectedMatch()!.status === 'in') {
                      <span class="badge badge-live" style="font-size:0.65rem"><span class="live-dot"></span> {{ selectedMatch()!.displayClock }}</span>
                    } @else if (selectedMatch()!.status === 'post') {
                      <span class="badge badge-finished" style="font-size:0.65rem">FT</span>
                    }
                  </div>
                </div>

                <!-- Source Selector -->
                <div class="source-selector">
                  <span class="source-label">Stream Source:</span>
                  <div class="source-tabs">
                    @for (src of streamSources(); track src.id) {
                      <button class="source-btn" [class.active]="selectedSource()?.id === src.id" (click)="selectSource(src)">
                        {{ src.label }}<span class="src-quality">{{ src.quality }} · {{ src.lang }}</span>
                      </button>
                    }
                  </div>
                </div>

                <!-- Video Player -->
                <div class="video-wrapper">
                  @if (selectedSource()?.external) {
                    <div class="external-stream-overlay">
                      <div class="external-stream-content animate-fadeIn">
                        <div class="ext-icon">⚡</div>
                        <h3>StreamsEast Live Feed</h3>
                        <p>This stream cannot be embedded directly due to iframe protection.</p>
                        <a [href]="selectedSource()!.url" target="_blank" class="external-stream-btn">
                          Open StreamsEast Stream ↗
                        </a>
                        <p class="ext-disclaimer">We recommend using an ad-blocker for third-party streaming sites.</p>
                      </div>
                    </div>
                  } @else if (safeUrl()) {
                    <iframe
                      [attr.src]="safeUrl()"
                      frameborder="0"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowfullscreen
                      class="video-frame">
                    </iframe>
                    <!-- Upcoming overlay -->
                    @if (selectedMatch()!.status === 'pre') {
                      <div class="upcoming-overlay">
                        <div class="upcoming-overlay-content">
                          <div>⏰</div>
                          <h3>Stream starts at kick-off</h3>
                          <p>{{ selectedMatch()!.homeTeam.name }} vs {{ selectedMatch()!.awayTeam.name }}</p>
                          <p><strong>{{ formatTime(selectedMatch()!.date) }}</strong></p>
                          <div style="margin-top:12px; font-size:0.82rem; color:#8ca0c8">
                            📺 Available on: {{ selectedMatch()!.broadcasts.join(' · ') || 'FIFA+, ESPN, Fox Sports' }}
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>

                <!-- Broadcast Info -->
                @if (selectedMatch()!.broadcasts.length > 0) {
                  <div class="broadcast-bar">
                    <span class="broadcast-label">Official Broadcast:</span>
                    @for (b of selectedMatch()!.broadcasts; track b) {
                      <span class="broadcast-chip">{{ b }}</span>
                    }
                  </div>
                }

                <!-- In-player Ad -->
                <div style="margin-top:16px"><app-google-ad format="infeed"></app-google-ad></div>

              } @else {
                <div class="no-selection">
                  <div class="no-sel-icon">📺</div>
                  <h3>Select a Match</h3>
                  <p>Choose from Live or Upcoming matches on the left to start streaming.</p>
                  @if (loading()) {
                    <div class="spinner"></div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Tips -->
          <div class="stream-tips">
            <h3>📡 Streaming Tips</h3>
            <div class="grid-3">
              <div class="tip-card card"><span class="tip-icon">🔄</span><h4>Switch Sources</h4><p>Buffering? Switch source instantly—all sources are free and HD.</p></div>
              <div class="tip-card card"><span class="tip-icon">📱</span><h4>Mobile Ready</h4><p>Tap fullscreen for best experience on any mobile device.</p></div>
              <div class="tip-card card"><span class="tip-icon">🌐</span><h4>VPN Tips</h4><p>If streams are geo-blocked in your region, use a free VPN to access global broadcasts.</p></div>
            </div>
          </div>

          <div style="margin-top:32px"><app-google-ad format="rectangle"></app-google-ad></div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .live-header { margin-bottom: 32px; }
    .live-header-top { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
    .live-header-top h1 { margin: 0; }

    .disclaimer-bar { display: flex; gap: 12px; align-items: flex-start; background: rgba(231,76,60,0.06); border: 1px solid rgba(231,76,60,0.20); border-radius: 12px; padding: 14px 18px; margin-bottom: 32px; font-size: 0.85rem; color: #8ca0c8; }
    .disclaimer-bar span { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
    .disclaimer-bar p { margin: 0; }

    .stream-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; margin-bottom: 48px; }

    /* Match List */
    .match-list-panel { display: flex; flex-direction: column; gap: 0; max-height: 780px; overflow-y: auto; padding-right: 4px; }
    .match-list-panel::-webkit-scrollbar { width: 4px; }
    .panel-section { margin-bottom: 8px; }
    .panel-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #4a6080; font-weight: 700; padding: 12px 4px 6px; }
    .no-matches-panel { font-size: 0.8rem; color: #4a6080; padding: 10px 4px; }
    .match-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 6px; }
    .match-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }
    .match-item.selected { border-color: #e74c3c; background: rgba(231,76,60,0.08); }
    .match-item-done { opacity: 0.7; }
    .match-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .mi-group { font-size: 0.7rem; color: #d4af37; font-weight: 600; }
    .match-item-teams { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
    .mi-team { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #f0f4ff; }
    .mi-team.winner { color: #d4af37; }
    .mi-logo { width: 18px; height: 18px; object-fit: contain; }
    .mi-score { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 0.95rem; color: #f0f4ff; padding: 2px 0; text-align: center; }
    .match-item-meta { font-size: 0.7rem; color: #4a6080; }
    .mi-broadcasts { font-size: 0.68rem; color: #8ca0c8; margin-top: 4px; }

    /* Player Panel */
    .player-panel { display: flex; flex-direction: column; gap: 16px; min-height: 400px; }

    .player-header { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
    .player-match-teams { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .ph-team { display: flex; align-items: center; gap: 10px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; flex: 1; }
    .ph-team.right { justify-content: flex-end; }
    .ph-logo { width: 40px; height: 40px; object-fit: contain; }
    .ph-score { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; color: #f0f4ff; min-width: 80px; text-align: center; }
    .live-score { color: #e74c3c; }
    .player-meta-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #8ca0c8; flex-wrap: wrap; }

    .source-selector { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .source-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: #8ca0c8; font-weight: 600; white-space: nowrap; padding-top: 10px; }
    .source-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
    .source-btn { display: flex; flex-direction: column; padding: 8px 14px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); color: #8ca0c8; font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .source-btn:hover { background: rgba(255,255,255,0.10); color: #f0f4ff; }
    .source-btn.active { background: rgba(231,76,60,0.20); border-color: rgba(231,76,60,0.50); color: #e74c3c; }
    .src-quality { font-size: 0.63rem; color: #4a6080; margin-top: 2px; }

    .video-wrapper { position: relative; width: 100%; padding-top: 56.25%; background: #000; border-radius: 16px; overflow: hidden; border: 2px solid rgba(231,76,60,0.30); box-shadow: 0 0 40px rgba(231,76,60,0.15); }
    .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
    .upcoming-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,10,26,0.88); display: flex; align-items: center; justify-content: center; z-index: 2; }
    .upcoming-overlay-content { text-align: center; padding: 32px; }
    .upcoming-overlay-content div:first-child { font-size: 4rem; margin-bottom: 16px; }
    .upcoming-overlay-content h3 { font-size: 1.4rem; margin-bottom: 12px; }
    .upcoming-overlay-content p { color: #8ca0c8; margin-bottom: 6px; }
    .upcoming-overlay-content strong { color: #d4af37; }

    .external-stream-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 15, 30, 0.95); display: flex; align-items: center; justify-content: center; z-index: 2; }
    .external-stream-content { text-align: center; padding: 24px; max-width: 420px; }
    .ext-icon { font-size: 3rem; color: #d4af37; margin-bottom: 12px; filter: drop-shadow(0 0 8px rgba(212,175,55,0.4)); }
    .external-stream-content h3 { font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin-bottom: 8px; color: #f0f4ff; }
    .external-stream-content p { font-size: 0.85rem; color: #8ca0c8; margin-bottom: 20px; }
    .external-stream-btn { display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #fff; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(231,76,60,0.3); transition: all 0.2s; }
    .external-stream-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(231,76,60,0.5); background: linear-gradient(135deg, #ff6b57 0%, #d32f2f 100%); }
    .ext-disclaimer { font-size: 0.72rem !important; color: #4a6080 !important; margin-top: 14px; margin-bottom: 0 !important; }

    .broadcast-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 10px 16px; }
    .broadcast-label { font-size: 0.75rem; color: #8ca0c8; font-weight: 600; }
    .broadcast-chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 999px; padding: 3px 10px; font-size: 0.75rem; color: #f0f4ff; font-weight: 600; }

    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; gap: 16px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.10); border-radius: 16px; padding: 48px; }
    .no-sel-icon { font-size: 5rem; }
    .no-selection h3 { font-size: 1.5rem; margin-bottom: 8px; }
    .no-selection p { color: #8ca0c8; }
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stream-tips { margin-top: 48px; }
    .stream-tips h3 { margin-bottom: 20px; font-size: 1.3rem; }
    .tip-card { display: flex; flex-direction: column; gap: 10px; }
    .tip-icon { font-size: 2rem; }
    .tip-card h4 { font-family: 'Outfit', sans-serif; font-size: 1rem; }

    @media (max-width: 900px) {
      .stream-layout { grid-template-columns: 1fr; }
      .match-list-panel { max-height: 320px; }
    }
  `]
})
export class LiveStreamComponent implements OnInit, OnDestroy {
  private espn = inject(EspnService);
  private sanitizer = inject(DomSanitizer);
  private sub = new Subscription();

  loading = signal(true);
  liveMatches = signal<LiveMatch[]>([]);
  upcomingMatches = signal<LiveMatch[]>([]);
  finishedMatches = signal<LiveMatch[]>([]);
  selectedMatch = signal<LiveMatch | null>(null);
  selectedSource = signal<StreamSource | null>(null);
  safeUrl = signal<SafeResourceUrl | null>(null);
  streamSources = signal<StreamSource[]>([]);

  ngOnInit() {
    this.sub.add(this.espn.today$.subscribe(matches => {
      this.liveMatches.set(this.espn.getLiveMatches(matches));
      this.upcomingMatches.set(this.espn.getUpcomingMatches(matches));
      this.finishedMatches.set(this.espn.getFinishedMatches(matches));
      this.loading.set(false);

      // Auto-select first live match
      if (!this.selectedMatch()) {
        const first = this.liveMatches()[0] ?? this.upcomingMatches()[0];
        if (first) this.selectMatch(first);
      }
    }));
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  selectMatch(match: LiveMatch) {
    this.selectedMatch.set(match);
    const sources = BROADCAST_STREAMS['default'];
    this.streamSources.set(sources);
    this.selectSource(sources[0]);
  }

  selectSource(src: StreamSource) {
    this.selectedSource.set(src);
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(src.url));
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
  }
}
