import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ContentStore } from '../../services/content-store.service';

const STORAGE_KEY = 'lf_age_verified';

@Component({
  selector: 'app-age-gate',
  standalone: true,
  imports: [],
  templateUrl: './age-gate.component.html',
  styleUrl: './age-gate.component.scss'
})
export class AgeGateComponent implements OnInit, OnDestroy {
  @ViewChild('gateEl') private readonly gateElRef?: ElementRef<HTMLDivElement>;

  private readonly content = inject(ContentStore);

  open = false;
  denied = false;

  readonly logo = this.content.image('ageGate.logoImage', 'assets/brand/brand-head.png', 'Lead Farmer');
  readonly eyebrow = this.content.text('ageGate.eyebrow', 'Age Verification');
  readonly heading = this.content.text('ageGate.heading', 'Are You 21 or Older?');
  readonly body = this.content.text(
    'ageGate.body',
    'This site features cannabis products intended for adults 21 years of age and older. Please confirm your age to continue.'
  );
  readonly confirmLabel = this.content.text('ageGate.confirmButtonLabel', "Yes, I'm 21+");
  readonly denyLabel = this.content.text('ageGate.denyButtonLabel', "No, I'm Not");

  readonly deniedHeading = this.content.text('ageGate.deniedHeading', 'Access Restricted');
  readonly deniedBody = this.content.text('ageGate.deniedBody', 'You must be 21 years of age or older to view this site.');
  readonly deniedButtonLabel = this.content.text('ageGate.deniedButtonLabel', 'Leave Site');
  readonly deniedButtonLink = this.content.text('ageGate.deniedButtonLink', 'https://www.google.com');

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    let verified = false;
    try {
      verified = this.document.defaultView?.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      // Storage unavailable (private browsing, etc.) — fall back to gating every visit.
    }

    if (!verified) {
      this.open = true;
      this.document.body.style.overflow = 'hidden';
      setTimeout(() => this.gateElRef?.nativeElement.focus());
    }
  }

  ngOnDestroy(): void {
    if (this.open) {
      this.document.body.style.overflow = '';
    }
  }

  confirm(): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable — the gate will just show again on the next visit.
    }
    this.open = false;
    this.document.body.style.overflow = '';
  }

  deny(): void {
    this.denied = true;
  }
}
