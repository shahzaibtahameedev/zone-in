import { ConsoleType } from './console-config.model';

export type TournamentStatus = 'Draft' | 'Published' | 'Cancelled';

export type TournamentSaveStatus = 'Draft' | 'Published';

export interface Tournament {
  id: string;
  name: string;
  game: string;
  consoleType: ConsoleType;
  zoneId: string;
  date: string;
  startTime: string;
  maxPlayers: number;
  entryFee?: number;
  prize?: string;
  description?: string;
  status: TournamentStatus;
}

export interface TournamentDto {
  name: string;
  game: string;
  consoleType: ConsoleType;
  zoneId: string;
  date: string;
  startTime: string;
  maxPlayers: number;
  entryFee?: number;
  prize?: string;
  description?: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  playerName: string;
  email: string;
  registeredAt: string;
}

export interface TournamentListItem {
  tournament: Tournament;
  zoneName: string;
  registeredCount: number;
}

export interface TournamentEnrollmentDto {
  playerName: string;
  email: string;
}

export interface OpenTournamentItem {
  tournament: Tournament;
  zoneName: string;
  registeredCount: number;
  isEnrolled: boolean;
  isFull: boolean;
}
