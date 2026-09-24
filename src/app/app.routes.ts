import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StrainCatalogComponent } from './pages/strain-catalog/strain-catalog.component';
import { StrainDetailComponent } from './pages/strain-detail/strain-detail.component';
import { MerchComponent } from './pages/merch/merch.component';
import { StoryComponent } from './pages/story/story.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Lead Farmer — Southern Tier Cannabis Cultivation' },
  { path: 'story', component: StoryComponent, title: 'Our Story — Lead Farmer' },
  { path: 'strains', component: StrainCatalogComponent, title: 'Strains — Lead Farmer' },
  // StrainDetailComponent sets its own title/meta per strain via SeoService
  { path: 'strains/:slug', component: StrainDetailComponent },
  { path: 'merch', component: MerchComponent, title: 'Merch — Lead Farmer' },

  // The content manager. Lazy-loaded so its code never reaches public visitors,
  // and gated server-side on every API call it makes.
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },

  { path: '**', redirectTo: '' }
];
