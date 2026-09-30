import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">⚽ <span>FIFA World Cup 2026™</span></div>
            <p>The ultimate hub for all things FIFA World Cup 2026. Watch free live streams, track scores, and simulate the bracket.</p>
            <div class="footer-disclaimer">
              <span>⚠️</span>
              <p>This site aggregates publicly available streams and is not affiliated with FIFA. All rights reserved to respective rights holders.</p>
            </div>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <h4>Navigate</h4>
              <ul>
                <li><a routerLink="/">🏠 Home</a></li>
                <li><a routerLink="/matches">📅 Schedule</a></li>
                <li><a routerLink="/live">🔴 Live Streams</a></li>
                <li><a routerLink="/simulator">🏆 Simulator</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Host Cities</h4>
              <ul>
                <li><span>🇺🇸 New York / NJ</span></li>
                <li><span>🇺🇸 Los Angeles</span></li>
                <li><span>🇺🇸 Dallas</span></li>
                <li><span>🇲🇽 Mexico City</span></li>
                <li><span>🇨🇦 Toronto</span></li>
                <li><span>🇨🇦 Vancouver</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 World Cup Hub – Built for fans, by fans. Not affiliated with FIFA.</p>
          <p class="ads-note">Ads powered by <strong>Google AdSense</strong>. Integrating ads helps keep this service free.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #030810;
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 48px 0 24px;
      margin-top: 80px;
    }
    .footer-top { display: grid; grid-template-columns: 1.5fr 1fr; gap: 48px; margin-bottom: 40px; }
    .footer-logo { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 900; color: #d4af37; margin-bottom: 12px; }
    .footer-logo span { margin-left: 8px; }
    .footer-brand p { color: #8ca0c8; font-size: 0.88rem; line-height: 1.6; }
    .footer-disclaimer {
      margin-top: 16px; display: flex; gap: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 8px; padding: 12px;
    }
    .footer-disclaimer p { font-size: 0.78rem; color: #4a6080; margin: 0; }
    .footer-links { display: flex; gap: 40px; }
    .footer-col h4 { font-family: 'Outfit', sans-serif; font-weight: 700; color: #f0f4ff; margin-bottom: 16px; font-size: 0.9rem; }
    .footer-col ul { display: flex; flex-direction: column; gap: 10px; }
    .footer-col a, .footer-col span { color: #8ca0c8; font-size: 0.88rem; text-decoration: none; transition: color 0.2s; cursor: default; }
    .footer-col a:hover { color: #d4af37; cursor: pointer; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .footer-bottom p { color: #4a6080; font-size: 0.78rem; }
    .ads-note strong { color: #d4af37; }
    @media (max-width: 768px) {
      .footer-top { grid-template-columns: 1fr; gap: 24px; }
      .footer-bottom { flex-direction: column; text-align: center; }
    }
  `]
})
export class FooterComponent {}
