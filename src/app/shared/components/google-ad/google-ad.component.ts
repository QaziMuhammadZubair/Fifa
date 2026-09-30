import { Component, Input, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdFormat = 'banner' | 'rectangle' | 'leaderboard' | 'sidebar' | 'infeed';

@Component({
  selector: 'app-google-ad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-wrapper" [class]="'ad-' + format" [class.ad-mock]="!publisherId || publisherId === 'ca-pub-8176827261099189'">
      @if (!publisherId || publisherId === 'ca-pub-8176827261099189') {
        <!-- Mock Ad Placeholder -->
        <div class="ad-mock-inner">
          <div class="ad-mock-label">Advertisement</div>
          <div class="ad-mock-content">
            @if (format === 'banner' || format === 'leaderboard') {
              <div class="ad-mock-banner">
                <span class="ad-mock-icon">⚽</span>
                <div class="ad-mock-text">
                  <strong>Get FIFA World Cup 2026 Gear</strong>
                  <span>Official jerseys, balls & more – Shop Now →</span>
                </div>
              </div>
            } @else if (format === 'rectangle') {
              <div class="ad-mock-rect">
                <div class="ad-mock-img">🏆</div>
                <strong>World Cup 2026</strong>
                <span>Stream every match free with FIFA+</span>
                <button class="ad-mock-cta">Watch Now</button>
              </div>
            } @else {
              <div class="ad-mock-sidebar">
                <div class="ad-mock-img">🎽</div>
                <strong>Fan Gear Store</strong>
                <span>Official Kits & More</span>
                <button class="ad-mock-cta">Shop</button>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Real AdSense Ad -->
        <ins class="adsbygoogle"
             style="display:block"
             [attr.data-ad-client]="publisherId"
             [attr.data-ad-slot]="adSlot"
             data-ad-format="auto"
             data-full-width-responsive="true">
        </ins>
      }
    </div>
  `,
  styles: [`
    .ad-wrapper {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
    .ad-mock {
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px dashed rgba(255,255,255,0.12);
    }
    .ad-mock-inner {
      position: relative;
    }
    .ad-mock-label {
      position: absolute;
      top: 6px;
      right: 10px;
      font-size: 0.65rem;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      z-index: 1;
    }

    /* Banner / Leaderboard */
    .ad-banner .ad-mock-inner,
    .ad-leaderboard .ad-mock-inner { min-height: 90px; }
    .ad-mock-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
    }
    .ad-mock-icon { font-size: 2.5rem; }
    .ad-mock-text { display: flex; flex-direction: column; gap: 4px; }
    .ad-mock-text strong { color: #f0f4ff; font-size: 1rem; }
    .ad-mock-text span { color: #8ca0c8; font-size: 0.85rem; }

    /* Rectangle */
    .ad-rectangle .ad-mock-inner { min-height: 250px; }
    .ad-mock-rect {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 24px;
      text-align: center;
      min-height: 250px;
    }

    /* Sidebar / Infeed */
    .ad-sidebar .ad-mock-inner,
    .ad-infeed .ad-mock-inner { min-height: 120px; }
    .ad-mock-sidebar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
    }

    .ad-mock-img { font-size: 2rem; }
    .ad-mock-rect .ad-mock-img { font-size: 3rem; margin-bottom: 4px; }
    .ad-mock-rect strong,
    .ad-mock-sidebar strong { color: #f0f4ff; font-weight: 700; }
    .ad-mock-rect span,
    .ad-mock-sidebar span { color: #8ca0c8; font-size: 0.85rem; }
    .ad-mock-cta {
      background: linear-gradient(135deg, #d4af37, #f7e26b);
      color: #000;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 8px 20px;
      border-radius: 999px;
      cursor: pointer;
      border: none;
      margin-top: 4px;
      transition: transform 0.2s;
    }
    .ad-mock-cta:hover { transform: scale(1.05); }

    .ad-mock-sidebar strong,
    .ad-mock-sidebar span { display: block; }
  `]
})
export class GoogleAdComponent implements AfterViewInit {
  @Input() format: AdFormat = 'banner';
  @Input() publisherId: string = 'ca-pub-8176827261099189';
  @Input() adSlot: string = '2759618179';

  ngAfterViewInit() {
    if (this.publisherId && this.publisherId !== 'ca-pub-8176827261099189') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // AdSense not loaded
      }
    }
  }
}
