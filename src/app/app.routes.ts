import { Routes } from '@angular/router';
import { pageTitle } from './core/config/app-paths';
import { adminGuard, ownerGuard } from './core/guards/session.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: pageTitle('Choose a role'),
    loadComponent: async () =>
      (await import('./features/role-select/role-select.component')).RoleSelectComponent,
  },
  {
    path: 'owner',
    canActivate: [ownerGuard],
    loadChildren: async () => (await import('./features/owner/owner.routes')).OWNER_ROUTES,
  },
  {
    path: 'customer',
    loadChildren: async () => (await import('./features/customer/customer.routes')).CUSTOMER_ROUTES,
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: async () => (await import('./features/admin/admin.routes')).ADMIN_ROUTES,
  },
  { path: '**', redirectTo: '' },
];
