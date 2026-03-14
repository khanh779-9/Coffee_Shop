import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';

type NavTab = 'home' | 'menu' | 'about' | 'contact';
type SectionId = 'home-top' | 'menu' | 'about' | 'contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly scrolled = signal(false);
  protected readonly onHome = signal(true);
  protected readonly activeNav = signal<NavTab>('home');
  protected readonly mobileNavOpen = signal(false);

  constructor() {
    effect(() => {
      const shouldLockScroll = this.mobileNavOpen() || this.cartService.isOpen();
      document.body.classList.toggle('no-scroll', shouldLockScroll);
      document.documentElement.classList.toggle('no-scroll', shouldLockScroll);
    });

    this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const path = event.urlAfterRedirects.split('#')[0];
      const isHome = path === '/';
      this.onHome.set(isHome);
      this.scrolled.set(window.scrollY > 60);
      this.mobileNavOpen.set(false);

      if (!isHome) {
        this.activeNav.set('home');
        return;
      }

      this.syncNavWithHash();
      setTimeout(() => {
        const hash = window.location.hash.replace('#', '') as SectionId | '';
        if (hash) {
          this.scrollToSection(hash, false);
        }
        this.updateActiveNavByScroll();
      }, 0);
    });
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav();
    }

    if (this.cartService.isOpen()) {
      this.cartService.close();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
    this.updateActiveNavByScroll();
  }

  @HostListener('window:hashchange')
  onHashChange(): void {
    this.syncNavWithHash();
  }

  protected setActiveNav(tab: NavTab): void {
    this.activeNav.set(tab);
  }

  protected goToSection(event: Event, sectionId: SectionId, tab: NavTab): void {
    event.preventDefault();
    this.setActiveNav(tab);
    this.closeMobileNav();

    if (this.onHome()) {
      this.scrollToSection(sectionId, true);
      return;
    }

    this.router.navigate(['/'], { fragment: sectionId });
  }

  protected toCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update(value => !value);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected toggleCart(): void {
    this.closeMobileNav();
    this.cartService.toggle();
  }

  protected closeCart(): void {
    this.cartService.close();
  }

  private syncNavWithHash(): void {
    if (!this.onHome()) {
      return;
    }

    const hash = window.location.hash;
    if (hash === '#home-top') {
      this.activeNav.set('home');
      return;
    }
    if (hash === '#menu') {
      this.activeNav.set('menu');
      return;
    }
    if (hash === '#about') {
      this.activeNav.set('about');
      return;
    }
    if (hash === '#contact') {
      this.activeNav.set('contact');
      return;
    }

    this.activeNav.set('home');
  }

  private updateActiveNavByScroll(): void {
    if (!this.onHome()) {
      return;
    }

    const markerY = window.scrollY + Math.max(110, Math.floor(window.innerHeight * 0.2));
    const homeTop = document.getElementById('home-top')?.offsetTop ?? 0;
    const menuTop = document.getElementById('menu')?.offsetTop ?? Number.POSITIVE_INFINITY;
    const aboutTop = document.getElementById('about')?.offsetTop ?? Number.POSITIVE_INFINITY;
    const contactTop = document.getElementById('contact')?.offsetTop ?? Number.POSITIVE_INFINITY;

    if (markerY >= contactTop - 28) {
      this.activeNav.set('contact');
      return;
    }
    if (markerY >= aboutTop - 28) {
      this.activeNav.set('about');
      return;
    }
    if (markerY >= menuTop - 28) {
      this.activeNav.set('menu');
      return;
    }
    if (markerY >= homeTop) {
      this.activeNav.set('home');
    }
  }

  private scrollToSection(sectionId: SectionId, smooth: boolean): void {
    if (sectionId === 'home-top') {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      history.replaceState(null, '', '#home-top');
      return;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    const top = section.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    history.replaceState(null, '', `#${sectionId}`);
  }
}
