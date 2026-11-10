export type MatchStatus = 'Active' | 'Completed';

export type MatchReportStatus = 'Open' | 'Resolved';

export interface Match {
  id: string;
  game: string;
  player1: string;
  player1Email?: string;
  player2?: string;
  player2Email?: string;
  zoneId: string;
  dateTime: string;
  status: MatchStatus;
  result?: string;
}

export interface MatchReport {
  id: string;
  matchId: string;
  reportedBy: string;
  reason: string;
  reportedAt: string;
  status: MatchReportStatus;
}

export interface MatchListItem {
  match: Match;
  zoneName: string;
}

export interface MatchReportListItem {
  report: MatchReport;
  game: string;
  players: string;
}

export interface MatchDto {
  game: string;
  zoneId: string;
  date: string;
  startTime: string;
  playerName: string;
  playerEmail: string;
}

export interface MatchPlayerDto {
  playerName: string;
  playerEmail: string;
}
