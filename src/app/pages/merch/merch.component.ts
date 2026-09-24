import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { ContentStore } from '../../services/content-store.service';

@Component({
  selector: 'app-merch',
  standalone: true,
  templateUrl: './merch.component.html',
  styleUrl: './merch.component.scss'
})
export class MerchComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly content = inject(ContentStore);

  readonly eyebrow = this.content.text('merch.pageEyebrow', 'Wear The Brand');
  readonly heading = this.content.text('merch.pageHeading', 'Merch');
  readonly intro = this.content.text(
    'merch.pageIntro',
    'Hats, tees, and more — our full merch lineup lives on our online store. Head over there to shop.'
  );
  readonly buttonLabel = this.content.text('merch.storeButtonLabel', 'Shop Merch');

  /** Set in the admin panel; '#' until the real storefront exists. */
  readonly storeUrl = this.content.text('merch.storeUrl', '#');

  ngOnInit(): void {
    this.seoService.set({
      title: this.content.text('seo.merchTitle', 'Merch — Lead Farmer'),
      description: this.content.text(
        'seo.merchDescription',
        'Lead Farmer branded merch — shop hats, tees, and more on our online store.'
      )
    });
  }
}
