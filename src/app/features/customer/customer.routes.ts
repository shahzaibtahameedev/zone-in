import { Routes } from '@angular/router';
import { pageTitle } from '../../core/config/app-paths';
import { customerEmailGuard, selectedSlotGuard } from '../../core/guards/session.guards';
import { CustomerLayoutComponent } from './customer-layout.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: pageTitle('Book a gaming session'),
        loadComponent: async () =>
          (await import('./enter-email/enter-email.component')).EnterEmailComponent,
      },
      {
        path: 'browse',
        canActivate: [customerEmailGuard],
        title: pageTitle('Find an available slot'),
        loadComponent: async () => (await import('./browse/browse.component')).BrowseComponent,
      },
      {
        path: 'summary',
        canActivate: [customerEmailGuard, selectedSlotGuard],
        title: pageTitle('Booking summary'),
        loadComponent: async () =>
          (await import('./booking-summary/booking-summary.component')).BookingSummaryComponent,
      },
      {
        path: 'matches',
        canActivate: [customerEmailGuard],
        title: pageTitle('1v1 Matches'),
        loadComponent: async () =>
          (await import('./matches/customer-matches.component')).CustomerMatchesComponent,
      },
      {
        path: 'matches/new',
        canActivate: [customerEmailGuard],
        title: pageTitle('Create a 1v1 slot'),
        loadComponent: async () =>
          (await import('./create-match/create-match.component')).CreateMatchComponent,
      },
      {
        path: 'matches/:id/join',
        canActivate: [customerEmailGuard],
        title: pageTitle('Join a 1v1 match'),
        loadComponent: async () =>
          (await import('./join-match/join-match.component')).JoinMatchComponent,
      },
      {
        path: 'tournaments',
        canActivate: [customerEmailGuard],
        title: pageTitle('Tournaments'),
        loadComponent: async () =>
          (await import('./tournaments/customer-tournaments.component'))
            .CustomerTournamentsComponent,
      },
      {
        path: 'tournaments/:id/enroll',
        canActivate: [customerEmailGuard],
        title: pageTitle('Enroll in a tournament'),
        loadComponent: async () =>
          (await import('./enroll-tournament/enroll-tournament.component'))
            .EnrollTournamentComponent,
      },
    ],
  },
];
