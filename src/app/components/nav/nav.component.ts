import { Component, HostListener, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentStore } from '../../services/content-store.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, OnDestroy {
  private routerSubscription?: Subscription;

  // Only the homepage has a full-bleed dark hero behind the nav, so only there should
  // the nav start transparent and switch to solid white once scrolled. Every other page
  // has a white background from the top, so the nav stays permanently in its solid state.
  private onDarkHeroRoute = true;

  private readonly content = inject(ContentStore);

  scrolled = false;
  menuOpen = false;

  readonly logo = this.content.image('nav.logoImage', 'assets/brand/brand-head.png', 'Lead Farmer');
  readonly links = {
    story: this.content.text('nav.storyLabel', 'Story'),
    strains: this.content.text('nav.strainsLabel', 'Strains'),
    gallery: this.content.text('nav.galleryLabel', 'Gallery'),
    articles: this.content.text('nav.articlesLabel', 'Articles'),
    merch: this.content.text('nav.merchLabel', 'Merch'),
    contact: this.content.text('nav.contactLabel', 'Contact')
  };

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.updateRouteState(this.router.url);
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.updateScrolled();
    if (this.scrolled) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.document.body.style.overflow = '';
  }

  private updateRouteState(url: string): void {
    const path = url.split(/[?#]/)[0];
    this.onDarkHeroRoute = path === '/';
    this.updateScrolled();
  }

  private updateScrolled(): void {
    this.scrolled = !this.onDarkHeroRoute || window.scrollY > 60;
  }
}
