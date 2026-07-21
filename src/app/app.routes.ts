import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StrainCatalogComponent } from './pages/strain-catalog/strain-catalog.component';
import { StrainDetailComponent } from './pages/strain-detail/strain-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Lead Farmer — Southern Tier Cannabis Cultivation' },
  { path: 'strains', component: StrainCatalogComponent, title: 'Strains — Lead Farmer' },
  // StrainDetailComponent sets its own title/meta per strain via SeoService
  { path: 'strains/:slug', component: StrainDetailComponent },
  { path: '**', redirectTo: '' }
];
