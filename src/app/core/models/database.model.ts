import { Booking } from './booking.model';
import { ConsoleConfig } from './console-config.model';
import { Customer } from './customer.model';
import { GamingZone } from './gaming-zone.model';
import { Match, MatchReport } from './match.model';
import { Tournament, TournamentRegistration } from './tournament.model';

export interface DatabaseTables {
  zones: GamingZone[];
  consoles: ConsoleConfig[];
  bookings: Booking[];
  customers: Customer[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  matches: Match[];
  matchReports: MatchReport[];
}

export type TableName = keyof DatabaseTables;
