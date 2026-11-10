import { Injectable, inject } from '@angular/core';
import { GAMES } from '../config/app.constants';
import {
  Match,
  MatchDto,
  MatchListItem,
  MatchPlayerDto,
  MatchReportListItem,
  MatchStatus,
  ServiceResult,
  fail,
  succeed,
} from '../models';
import { toLocalIsoDateTime } from '../utils/date-time.utils';
import { createId, normalizeEmail } from '../utils/id.utils';
import { getPlayerNameError, isDateTimeInPast } from '../utils/player.utils';
import { getOpeningHoursLabel, isWithinOpeningHours } from '../utils/time-slot.utils';
import { StorageService } from './storage.service';

const MATCH_ID_PREFIX = 'match';
const MATCH_DURATION_HOURS = 1;
const UNKNOWN_ZONE_NAME = 'Unknown gaming zone';
const UNKNOWN_MATCH_LABEL = 'Unknown match';
const WAITING_PLAYER_LABEL = 'Waiting for opponent';
const MATCH_NOT_FOUND_MESSAGE = 'This 1v1 match could not be found.';
const GAME_MESSAGE = 'Pick a game from the list.';
const ZONE_MESSAGE = 'Pick an active gaming zone.';
const PAST_TIME_MESSAGE = 'This time has already passed. Pick a later date or time.';
const ALREADY_TAKEN_MESSAGE =
  'Sorry, someone else just joined this match. Please pick another one.';
const OWN_MATCH_MESSAGE = 'You cannot join your own match.';
const MATCH_CLOSED_MESSAGE = 'This match is no longer open.';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private readonly storage = inject(StorageService);

  getMatches(status: MatchStatus): MatchListItem[] {
    const isNewestFirst = status === 'Completed';
    const matches = this.storage
      .select('matches')
      .filter((match) => match.status === status)
      .sort((first, second) =>
        isNewestFirst
          ? second.dateTime.localeCompare(first.dateTime)
          : first.dateTime.localeCompare(second.dateTime),
      );
    const matchItems = this.toListItems(matches);

    return matchItems;
  }

  getOpenMatches(customerEmail: string, game: string | null): MatchListItem[] {
    const openMatches = this.storage
      .select('matches')
      .filter(
        (match) =>
          this.isOpenForJoining(match) &&
          !this.isPlayer1(match, customerEmail) &&
          (game === null || match.game === game),
      )
      .sort((first, second) => first.dateTime.localeCompare(second.dateTime));
    const matchItems = this.toListItems(openMatches);

    return matchItems;
  }

  getCustomerMatches(customerEmail: string): MatchListItem[] {
    const normalizedEmail = normalizeEmail(customerEmail);
    const customerMatches = this.storage
      .select('matches')
      .filter(
        (match) =>
          match.status === 'Active' &&
          !isDateTimeInPast(match.dateTime) &&
          (this.isPlayer1(match, normalizedEmail) ||
            normalizeEmail(match.player2Email ?? '') === normalizedEmail),
      )
      .sort((first, second) => first.dateTime.localeCompare(second.dateTime));
    const matchItems = this.toListItems(customerMatches);

    return matchItems;
  }

  getMatchById(matchId: string): MatchListItem | undefined {
    const match = this.storage.select('matches').find((item) => item.id === matchId);
    const matchItem = match ? this.toListItems([match])[0] : undefined;

    return matchItem;
  }

  createMatch(dto: MatchDto): ServiceResult<Match> {
    const validationError = this.validateNewMatch(dto);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const match: Match = {
      id: createId(MATCH_ID_PREFIX),
      game: dto.game,
      player1: dto.playerName.trim(),
      player1Email: normalizeEmail(dto.playerEmail),
      zoneId: dto.zoneId,
      dateTime: toLocalIsoDateTime(dto.date, dto.startTime),
      status: 'Active',
    };
    this.storage.save('matches', this.storage.select('matches').concat(match));
    const result = succeed(match);

    return result;
  }

  joinMatch(matchId: string, dto: MatchPlayerDto): ServiceResult<Match> {
    const existingMatch = this.storage.select('matches').find((match) => match.id === matchId);
    if (!existingMatch) {
      const notFound = fail(MATCH_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const validationError =
      this.validateJoin(existingMatch, dto.playerEmail) ?? getPlayerNameError(dto.playerName);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const joinedMatch: Match = Object.assign({}, existingMatch, {
      player2: dto.playerName.trim(),
      player2Email: normalizeEmail(dto.playerEmail),
    });
    const matches = this.storage
      .select('matches')
      .map((match) => (match.id === matchId ? joinedMatch : match));
    this.storage.save('matches', matches);
    const result = succeed(joinedMatch);

    return result;
  }

  getMatchReports(): MatchReportListItem[] {
    const matches = this.storage.select('matches');

    const reportItems = this.storage
      .select('matchReports')
      .slice()
      .sort((first, second) => second.reportedAt.localeCompare(first.reportedAt))
      .map((report) => {
        const match = matches.find((item) => item.id === report.matchId);
        const players = match
          ? `${match.player1} vs ${match.player2 ?? WAITING_PLAYER_LABEL}`
          : UNKNOWN_MATCH_LABEL;
        const listItem: MatchReportListItem = {
          report,
          game: match?.game ?? UNKNOWN_MATCH_LABEL,
          players,
        };

        return listItem;
      });

    return reportItems;
  }

  private isOpenForJoining(match: Match): boolean {
    const isOpen = match.status === 'Active' && !match.player2 && !isDateTimeInPast(match.dateTime);

    return isOpen;
  }

  private isPlayer1(match: Match, customerEmail: string): boolean {
    const isPlayer1 = normalizeEmail(match.player1Email ?? '') === normalizeEmail(customerEmail);

    return isPlayer1;
  }

  private validateNewMatch(dto: MatchDto): string | null {
    if (!GAMES.includes(dto.game)) {
      return GAME_MESSAGE;
    }

    const isActiveZone = this.storage
      .select('zones')
      .some((zone) => zone.id === dto.zoneId && zone.isActive);
    if (!isActiveZone) {
      return ZONE_MESSAGE;
    }

    if (!isWithinOpeningHours(dto.startTime, MATCH_DURATION_HOURS)) {
      return `Matches must start between ${getOpeningHoursLabel()}.`;
    }

    if (isDateTimeInPast(toLocalIsoDateTime(dto.date, dto.startTime))) {
      return PAST_TIME_MESSAGE;
    }

    const validationError = getPlayerNameError(dto.playerName);

    return validationError;
  }

  getJoinError(matchId: string, customerEmail: string): string | null {
    const match = this.storage.select('matches').find((item) => item.id === matchId);
    const joinError = match ? this.validateJoin(match, customerEmail) : MATCH_NOT_FOUND_MESSAGE;

    return joinError;
  }

  private validateJoin(match: Match, customerEmail: string): string | null {
    if (match.player2) {
      return ALREADY_TAKEN_MESSAGE;
    }

    if (!this.isOpenForJoining(match)) {
      return MATCH_CLOSED_MESSAGE;
    }

    const validationError = this.isPlayer1(match, customerEmail) ? OWN_MATCH_MESSAGE : null;

    return validationError;
  }

  private toListItems(matches: Match[]): MatchListItem[] {
    const zones = this.storage.select('zones');
    const matchItems = matches.map((match) => {
      const listItem: MatchListItem = {
        match,
        zoneName: zones.find((zone) => zone.id === match.zoneId)?.name ?? UNKNOWN_ZONE_NAME,
      };

      return listItem;
    });

    return matchItems;
  }
}
