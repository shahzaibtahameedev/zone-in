import { APP_NAME } from './app.constants';

export const APP_PATHS = {
  roleSelect: '/',
  owner: {
    dashboard: '/owner/dashboard',
    createBooking: '/owner/bookings/new',
    consoles: '/owner/consoles',
  },
  customer: {
    enterEmail: '/customer',
    browse: '/customer/browse',
    summary: '/customer/summary',
    matches: '/customer/matches',
    newMatch: '/customer/matches/new',
    joinMatch: (matchId: string) => `/customer/matches/${matchId}/join`,
    tournaments: '/customer/tournaments',
    enroll: (tournamentId: string) => `/customer/tournaments/${tournamentId}/enroll`,
  },
  admin: {
    dashboard: '/admin/dashboard',
    zones: '/admin/zones',
    newZone: '/admin/zones/new',
    editZone: (zoneId: string) => `/admin/zones/${zoneId}/edit`,
    bookings: '/admin/bookings',
    newBooking: '/admin/bookings/new',
    editBooking: (bookingId: string) => `/admin/bookings/${bookingId}/edit`,
    customers: '/admin/customers',
    customerDetails: (customerId: string) => `/admin/customers/${customerId}`,
    tournaments: '/admin/tournaments',
    newTournament: '/admin/tournaments/new',
    editTournament: (tournamentId: string) => `/admin/tournaments/${tournamentId}/edit`,
    registrations: (tournamentId: string) => `/admin/tournaments/${tournamentId}/registrations`,
    matches: '/admin/matches',
    matchReports: '/admin/matches/reports',
  },
};

export function pageTitle(pageName: string): string {
  const title = `${pageName} · ${APP_NAME}`;

  return title;
}
