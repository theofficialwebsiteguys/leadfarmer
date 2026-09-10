import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

// Swap this for the real storefront URL once it exists.
const MERCH_STORE_URL = '#';

@Component({
  selector: 'app-merch',
  standalone: true,
  templateUrl: './merch.component.html',
  styleUrl: './merch.component.scss'
})
export class MerchComponent implements OnInit {
  readonly storeUrl = MERCH_STORE_URL;

  constructor(private readonly seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.set({
      title: 'Merch — Lead Farmer',
      description: 'Lead Farmer branded merch — shop hats, tees, and more on our online store.'
    });
  }
}
