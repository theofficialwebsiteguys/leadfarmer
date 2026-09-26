import { Routes } from '@angular/router';
import { adminAuthGuard, adminLoginGuard, unsavedChangesGuard } from './services/admin.guards';

/**
 * Admin routes, lazy-loaded from app.routes.ts so none of this code ships to a
 * regular visitor's browser.
 *
 * The guards here only control navigation. Authorization is enforced server-side
 * on every /api/admin/* request.
 */
export const adminRoutes: Routes = [
  {
    path: 'login',
    canActivate: [adminLoginGuard],
    title: 'Sign in — Lead Farmer',
    loadComponent: () => import('./pages/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./pages/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        title: 'Dashboard — Lead Farmer',
        loadComponent: () => import('./pages/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'settings',
        title: 'Settings — Lead Farmer',
        canDeactivate: [unsavedChangesGuard],
        data: { section: 'settings' },
        loadComponent: () => import('./pages/page-content.component').then(m => m.PageContentComponent)
      },
      {
        path: 'strains',
        title: 'Strains — Lead Farmer',
        loadComponent: () => import('./pages/strain-list.component').then(m => m.StrainListComponent)
      },
      {
        path: 'strains/new',
        title: 'Add a strain — Lead Farmer',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/strain-editor.component').then(m => m.StrainEditorComponent)
      },
      {
        path: 'strains/:id',
        title: 'Edit strain — Lead Farmer',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/strain-editor.component').then(m => m.StrainEditorComponent)
      },
      {
        path: 'lists/:resource',
        title: 'Content — Lead Farmer',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./pages/collection-manager.component').then(m => m.CollectionManagerComponent)
      },
      {
        path: 'messages',
        title: 'Messages — Lead Farmer',
        loadComponent: () => import('./pages/messages.component').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'media',
        title: 'Images — Lead Farmer',
        loadComponent: () => import('./pages/media-library.component').then(m => m.MediaLibraryComponent)
      },
      { path: '**', redirectTo: '' }
    ]
  }
];
