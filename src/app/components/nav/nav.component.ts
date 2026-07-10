import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  scrolled = false;
  menuOpen = false;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 60;
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
}
