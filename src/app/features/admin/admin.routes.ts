import { Routes } from '@angular/router';
import { pageTitle } from '../../core/config/app-paths';
import { AdminLayoutComponent } from './admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: pageTitle('Dashboard'),
        loadComponent: async () =>
          (await import('./dashboard/admin-dashboard.component')).AdminDashboardComponent,
      },
      {
        path: 'zones',
        title: pageTitle('Gaming Zones'),
        loadComponent: async () =>
          (await import('./zones/zones-list.component')).ZonesListComponent,
      },
      {
        path: 'zones/new',
        title: pageTitle('Add Gaming Zone'),
        loadComponent: async () =>
          (await import('./zone-form/zone-form.component')).ZoneFormComponent,
      },
      {
        path: 'zones/:id/edit',
        title: pageTitle('Edit Gaming Zone'),
        loadComponent: async () =>
          (await import('./zone-form/zone-form.component')).ZoneFormComponent,
      },
      {
        path: 'bookings',
        title: pageTitle('Bookings'),
        loadComponent: async () =>
          (await import('./bookings/bookings-list.component')).BookingsListComponent,
      },
      {
        path: 'bookings/new',
        title: pageTitle('Create Booking'),
        loadComponent: async () =>
          (await import('./booking-form/booking-form.component')).BookingFormComponent,
      },
      {
        path: 'bookings/:id/edit',
        title: pageTitle('Edit Booking'),
        loadComponent: async () =>
          (await import('./booking-form/booking-form.component')).BookingFormComponent,
      },
      {
        path: 'customers',
        title: pageTitle('Customers'),
        loadComponent: async () =>
          (await import('./customers/customers-list.component')).CustomersListComponent,
      },
      {
        path: 'customers/:id',
        title: pageTitle('Customer Details'),
        loadComponent: async () =>
          (await import('./customer-details/customer-details.component')).CustomerDetailsComponent,
      },
      {
        path: 'tournaments',
        title: pageTitle('Tournaments'),
        loadComponent: async () =>
          (await import('./tournaments/tournaments-list.component')).TournamentsListComponent,
      },
      {
        path: 'tournaments/new',
        title: pageTitle('Create Tournament'),
        loadComponent: async () =>
          (await import('./tournament-form/tournament-form.component')).TournamentFormComponent,
      },
      {
        path: 'tournaments/:id/edit',
        title: pageTitle('Edit Tournament'),
        loadComponent: async () =>
          (await import('./tournament-form/tournament-form.component')).TournamentFormComponent,
      },
      {
        path: 'tournaments/:id/registrations',
        title: pageTitle('Tournament Registrations'),
        loadComponent: async () =>
          (await import('./registrations/registrations.component')).RegistrationsComponent,
      },
      {
        path: 'matches',
        title: pageTitle('1v1 Matches'),
        loadComponent: async () => (await import('./matches/matches.component')).MatchesComponent,
      },
      {
        path: 'matches/reports',
        title: pageTitle('Reported Matches'),
        loadComponent: async () =>
          (await import('./reported-matches/reported-matches.component')).ReportedMatchesComponent,
      },
    ],
  },
];
