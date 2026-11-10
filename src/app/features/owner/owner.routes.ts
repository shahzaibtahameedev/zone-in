import { Routes } from '@angular/router';
import { pageTitle } from '../../core/config/app-paths';
import { OwnerLayoutComponent } from './owner-layout.component';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    component: OwnerLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: pageTitle('Dashboard'),
        loadComponent: async () =>
          (await import('./dashboard/owner-dashboard.component')).OwnerDashboardComponent,
      },
      {
        path: 'bookings/new',
        title: pageTitle('Create Booking'),
        loadComponent: async () =>
          (await import('./create-booking/create-booking.component')).CreateBookingComponent,
      },
      {
        path: 'consoles',
        title: pageTitle('Consoles & Pricing'),
        loadComponent: async () =>
          (await import('./consoles-pricing/consoles-pricing.component')).ConsolesPricingComponent,
      },
    ],
  },
];
