import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

// Adds `.is-revealed` (see styles.scss `.reveal-on-scroll`) the first time the host
// element scrolls into view, then stops observing — a one-shot fade/slide-in reveal.
// Bind `[appRevealOnScroll]="false"` to opt an instance out entirely (e.g. a grid that
// re-renders on every filter change, where re-triggering the reveal reads as a glitch
// rather than an entrance).
@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input('appRevealOnScroll') enabled = true;

  private observer?: IntersectionObserver;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;

    if (!this.enabled || typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(element, 'is-revealed');
      return;
    }

    this.renderer.addClass(element, 'reveal-on-scroll');
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.renderer.addClass(element, 'is-revealed');
            this.observer?.unobserve(element);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
