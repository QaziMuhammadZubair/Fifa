import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="navbar-inner container">
        <a routerLink="/" class="brand">
          <div class="brand-icon">⚽</div>
          <div class="brand-text">
            <span class="brand-title">FIFA</span>
            <span class="brand-sub">World Cup 2026™</span>
          </div>
        </a>

        <ul class="nav-links hide-mobile">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/matches" routerLinkActive="active">Schedule</a></li>
          <li>
            <a routerLink="/live" routerLinkActive="active" class="live-link">
              <span class="live-dot-nav"></span>
              Live Streams
            </a>
          </li>
          <li><a routerLink="/simulator" routerLinkActive="active">Simulator</a></li>
        </ul>

        <div class="nav-right">
          <a routerLink="/live" class="btn btn-live btn-sm hide-mobile">
            <span class="live-dot-nav"></span> Watch Live
          </a>
          <button class="hamburger" (click)="toggleMenu()" aria-label="Menu">
            <span [class.open]="menuOpen()"></span>
            <span [class.open]="menuOpen()"></span>
            <span [class.open]="menuOpen()"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="mobile-menu animate-fadeIn">
          <ul>
            <li><a routerLink="/" (click)="closeMenu()">🏠 Home</a></li>
            <li><a routerLink="/matches" (click)="closeMenu()">📅 Schedule</a></li>
            <li><a routerLink="/live" (click)="closeMenu()">🔴 Live Streams</a></li>
            <li><a routerLink="/simulator" (click)="closeMenu()">🏆 Simulator</a></li>
          </ul>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 72px;
      z-index: 1000;
      transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
    }
    .navbar.scrolled {
      background: rgba(5, 10, 26, 0.90);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.08);
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-icon {
      font-size: 2rem;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .brand-text { display: flex; flex-direction: column; }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 900;
      background: linear-gradient(135deg, #d4af37, #f7e26b, #c8962a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
    .brand-sub {
      font-size: 0.65rem;
      color: #8ca0c8;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-links a {
      padding: 8px 16px;
      border-radius: 999px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      color: #8ca0c8;
      transition: color 0.2s, background 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-links a:hover { color: #f0f4ff; background: rgba(255,255,255,0.06); }
    .nav-links a.active { color: #d4af37; }
    .live-link { color: #e74c3c !important; }
    .live-dot-nav {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #e74c3c;
      animation: pulse-dot 1.2s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.4); }
    }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: 8px;
      cursor: pointer;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: #f0f4ff;
      border-radius: 2px;
      transition: all 0.3s;
    }
    .hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-menu {
      position: absolute;
      top: 72px;
      left: 0;
      width: 100%;
      background: rgba(5, 10, 26, 0.97);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 16px;
    }
    .mobile-menu ul { display: flex; flex-direction: column; gap: 4px; }
    .mobile-menu a {
      display: block;
      padding: 14px 20px;
      border-radius: 12px;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      color: #f0f4ff;
      font-size: 1rem;
      transition: background 0.2s;
    }
    .mobile-menu a:hover { background: rgba(255,255,255,0.06); }
    @media (max-width: 768px) {
      .hamburger { display: flex; }
    }
  `]
})
export class NavbarComponent {
  isScrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() { this.isScrolled.set(window.scrollY > 20); }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu()  { this.menuOpen.set(false); }
}
