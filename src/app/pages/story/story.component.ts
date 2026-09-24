import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { ContentStore } from '../../services/content-store.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss'
})
export class StoryComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly content = inject(ContentStore);

  readonly dispensaryRegions = this.content.dispensaryRegions;
  readonly dispensaryCount = this.content.dispensaryCount;
  readonly sections = this.content.storySections;
  readonly stats = this.content.storyStats;

  readonly heroImage = this.content.image('story.heroImage', 'assets/product/Zoap/zoap-flower.jpg');
  readonly heroEyebrow = this.content.text('story.heroEyebrow', 'The Craft');
  readonly heroHeadingLines = this.content.lines('story.heroHeading', 'Every Plant.\nEvery Room.\nEvery Harvest.');
  readonly heroTagline = this.content.text(
    'story.heroTagline',
    'Grown with precision, care, and deep respect for the craft — this is how we approach every batch, from the moment a clone is set to the final cure.'
  );

  readonly directoryEyebrow = this.content.text('story.directoryEyebrow', 'Where To Find Us');
  readonly directoryHeading = this.content.text('story.directoryHeading', 'Our Retail Partners');

  readonly ctaHeading = this.content.text('story.ctaHeading', 'Taste The Difference');
  readonly ctaBody = this.content.text('story.ctaBody', "See what's currently in rotation and find your next favorite.");
  readonly ctaPrimaryLabel = this.content.text('story.ctaPrimaryButtonLabel', 'Browse All Strains');
  readonly ctaPrimaryLink = this.content.text('story.ctaPrimaryButtonLink', '/strains');
  readonly ctaSecondaryLabel = this.content.text('story.ctaSecondaryButtonLabel', 'Get In Touch');
  readonly contactEmail = this.content.text('homepage.contactEmail', 'info@leadfarmer.com');

  /**
   * The intro sentence contains the live dispensary total, so the client never
   * has to remember to update a number when they add a shop. `{count}` in the
   * editable text is substituted here.
   */
  readonly directoryIntro = this.content
    .text(
      'story.directoryIntro',
      'Lead Farmer is currently stocked at {count} dispensaries across New York State — find one near you below.'
    )
    .replace('{count}', String(this.dispensaryCount));

  ngOnInit(): void {
    this.seoService.set({
      title: this.content.text('seo.storyTitle', 'Our Story — Lead Farmer'),
      description: this.content.text(
        'seo.storyDescription',
        'The story behind Lead Farmer — Southern Tier cannabis cultivation grown with precision and care, plus where to find it across New York.'
      )
    });
  }
}
