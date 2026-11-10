import { Injectable, inject } from '@angular/core';
import {
  TOURNAMENT_MIN_PLAYERS,
  TOURNAMENT_NAME_MAX_LENGTH,
  TOURNAMENT_NAME_MIN_LENGTH,
} from '../config/app.constants';
import {
  OpenTournamentItem,
  ServiceResult,
  Tournament,
  TournamentDto,
  TournamentEnrollmentDto,
  TournamentListItem,
  TournamentRegistration,
  TournamentSaveStatus,
  TournamentStatus,
  fail,
  succeed,
} from '../models';
import { createId, normalizeEmail } from '../utils/id.utils';
import { toLocalIsoDateTime } from '../utils/date-time.utils';
import { getPlayerNameError, isDateTimeInPast } from '../utils/player.utils';
import { StorageService } from './storage.service';

const TOURNAMENT_ID_PREFIX = 'tournament';
const TOURNAMENT_NOT_FOUND_MESSAGE = 'Tournament not found.';
const ZONE_NOT_FOUND_MESSAGE = 'Gaming zone not found.';
const NAME_LENGTH_MESSAGE = `Tournament name must be ${TOURNAMENT_NAME_MIN_LENGTH} to ${TOURNAMENT_NAME_MAX_LENGTH} characters.`;
const MAX_PLAYERS_MESSAGE = `Max players must be a whole number, ${TOURNAMENT_MIN_PLAYERS} or more.`;
const ENTRY_FEE_MESSAGE = 'Entry fee must be 0 or more.';
const CANNOT_REPUBLISH_MESSAGE = 'A cancelled tournament cannot be published again.';
const ONLY_DRAFT_PUBLISH_MESSAGE = 'Only draft tournaments can be published from the list.';
const ALREADY_CANCELLED_MESSAGE = 'This tournament is already cancelled.';
const UNKNOWN_ZONE_NAME = 'Unknown gaming zone';
const REGISTRATION_ID_PREFIX = 'registration';
const NOT_OPEN_MESSAGE = 'This tournament is not open for enrolment.';
const FULL_MESSAGE = 'Sorry, this tournament is full.';
const ALREADY_ENROLLED_MESSAGE = 'You are already enrolled in this tournament.';

@Injectable({ providedIn: 'root' })
export class TournamentsService {
  private readonly storage = inject(StorageService);

  getTournaments(): TournamentListItem[] {
    const zones = this.storage.select('zones');

    const tournamentItems = this.storage
      .select('tournaments')
      .slice()
      .sort((first, second) =>
        `${first.date}T${first.startTime}`.localeCompare(`${second.date}T${second.startTime}`),
      )
      .map((tournament) => {
        const listItem: TournamentListItem = {
          tournament,
          zoneName: zones.find((zone) => zone.id === tournament.zoneId)?.name ?? UNKNOWN_ZONE_NAME,
          registeredCount: this.getRegistrationCount(tournament.id),
        };

        return listItem;
      });

    return tournamentItems;
  }

  getOpenTournaments(customerEmail: string): OpenTournamentItem[] {
    const openTournaments = this.getTournaments()
      .filter((item) => this.isOpenForEnrolment(item.tournament))
      .map((item) => {
        const openItem: OpenTournamentItem = {
          tournament: item.tournament,
          zoneName: item.zoneName,
          registeredCount: item.registeredCount,
          isEnrolled: this.isEnrolled(item.tournament.id, customerEmail),
          isFull: item.registeredCount >= item.tournament.maxPlayers,
        };

        return openItem;
      });

    return openTournaments;
  }

  isEnrolled(tournamentId: string, email: string): boolean {
    const normalizedEmail = normalizeEmail(email);
    const isEnrolled = this.getRegistrations(tournamentId).some(
      (registration) => normalizeEmail(registration.email) === normalizedEmail,
    );

    return isEnrolled;
  }

  getEnrollError(tournamentId: string, email: string): string | null {
    const tournament = this.getTournamentById(tournamentId);
    const enrollError = tournament
      ? this.validateEnrolment(tournament, email)
      : TOURNAMENT_NOT_FOUND_MESSAGE;

    return enrollError;
  }

  enrollPlayer(
    tournamentId: string,
    dto: TournamentEnrollmentDto,
  ): ServiceResult<TournamentRegistration> {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) {
      const notFound = fail(TOURNAMENT_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const validationError =
      this.validateEnrolment(tournament, dto.email) ?? getPlayerNameError(dto.playerName);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const registration: TournamentRegistration = {
      id: createId(REGISTRATION_ID_PREFIX),
      tournamentId,
      playerName: dto.playerName.trim(),
      email: normalizeEmail(dto.email),
      registeredAt: new Date().toISOString(),
    };
    this.storage.save('registrations', this.storage.select('registrations').concat(registration));
    const result = succeed(registration);

    return result;
  }

  getTournamentById(tournamentId: string): Tournament | undefined {
    const tournament = this.storage.select('tournaments').find((item) => item.id === tournamentId);

    return tournament;
  }

  getRegistrations(tournamentId: string): TournamentRegistration[] {
    const registrations = this.storage
      .select('registrations')
      .filter((registration) => registration.tournamentId === tournamentId)
      .sort((first, second) => first.registeredAt.localeCompare(second.registeredAt));

    return registrations;
  }

  getRegistrationCount(tournamentId: string): number {
    const registrationCount = this.storage
      .select('registrations')
      .filter((registration) => registration.tournamentId === tournamentId).length;

    return registrationCount;
  }

  createTournament(dto: TournamentDto, status: TournamentSaveStatus): ServiceResult<Tournament> {
    const validationError = this.validateTournament(dto, 0);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const tournament = this.buildTournament(createId(TOURNAMENT_ID_PREFIX), dto, status);
    this.storage.save('tournaments', this.storage.select('tournaments').concat(tournament));
    const result = succeed(tournament);

    return result;
  }

  updateTournament(
    tournamentId: string,
    dto: TournamentDto,
    status: TournamentSaveStatus,
  ): ServiceResult<Tournament> {
    const existingTournament = this.getTournamentById(tournamentId);
    if (!existingTournament) {
      const notFound = fail(TOURNAMENT_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const validationError =
      this.validateStatusChange(existingTournament.status, status) ??
      this.validateTournament(dto, this.getRegistrationCount(tournamentId));
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const nextStatus: TournamentStatus =
      existingTournament.status === 'Cancelled' ? 'Cancelled' : status;
    const updatedTournament = this.buildTournament(tournamentId, dto, nextStatus);
    this.replaceTournament(updatedTournament);
    const result = succeed(updatedTournament);

    return result;
  }

  publishTournament(tournamentId: string): ServiceResult<Tournament> {
    const existingTournament = this.getTournamentById(tournamentId);
    const validationError =
      existingTournament?.status === 'Draft' ? null : ONLY_DRAFT_PUBLISH_MESSAGE;
    const result = this.changeStatus(tournamentId, 'Published', validationError);

    return result;
  }

  cancelTournament(tournamentId: string): ServiceResult<Tournament> {
    const existingTournament = this.getTournamentById(tournamentId);
    const validationError =
      existingTournament?.status === 'Cancelled' ? ALREADY_CANCELLED_MESSAGE : null;
    const result = this.changeStatus(tournamentId, 'Cancelled', validationError);

    return result;
  }

  deleteTournament(tournamentId: string): ServiceResult<Tournament> {
    const existingTournament = this.getTournamentById(tournamentId);
    if (!existingTournament) {
      const notFound = fail(TOURNAMENT_NOT_FOUND_MESSAGE);

      return notFound;
    }

    this.storage.save(
      'tournaments',
      this.storage.select('tournaments').filter((tournament) => tournament.id !== tournamentId),
    );
    this.storage.save(
      'registrations',
      this.storage
        .select('registrations')
        .filter((registration) => registration.tournamentId !== tournamentId),
    );
    const result = succeed(existingTournament);

    return result;
  }

  private changeStatus(
    tournamentId: string,
    status: TournamentStatus,
    validationError: string | null,
  ): ServiceResult<Tournament> {
    const existingTournament = this.getTournamentById(tournamentId);
    if (!existingTournament) {
      const notFound = fail(TOURNAMENT_NOT_FOUND_MESSAGE);

      return notFound;
    }

    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const updatedTournament: Tournament = Object.assign({}, existingTournament, { status });
    this.replaceTournament(updatedTournament);
    const result = succeed(updatedTournament);

    return result;
  }

  private isOpenForEnrolment(tournament: Tournament): boolean {
    const isOpen =
      tournament.status === 'Published' &&
      !isDateTimeInPast(toLocalIsoDateTime(tournament.date, tournament.startTime));

    return isOpen;
  }

  private validateEnrolment(tournament: Tournament, email: string): string | null {
    if (!this.isOpenForEnrolment(tournament)) {
      return NOT_OPEN_MESSAGE;
    }

    if (this.isEnrolled(tournament.id, email)) {
      return ALREADY_ENROLLED_MESSAGE;
    }

    const validationError =
      this.getRegistrationCount(tournament.id) >= tournament.maxPlayers ? FULL_MESSAGE : null;

    return validationError;
  }

  private validateStatusChange(
    currentStatus: TournamentStatus,
    requestedStatus: TournamentSaveStatus,
  ): string | null {
    const validationError =
      currentStatus === 'Cancelled' && requestedStatus === 'Published'
        ? CANNOT_REPUBLISH_MESSAGE
        : null;

    return validationError;
  }

  private validateTournament(dto: TournamentDto, registeredCount: number): string | null {
    const nameLength = dto.name.trim().length;
    if (nameLength < TOURNAMENT_NAME_MIN_LENGTH || nameLength > TOURNAMENT_NAME_MAX_LENGTH) {
      return NAME_LENGTH_MESSAGE;
    }

    const zoneExists = this.storage.select('zones').some((zone) => zone.id === dto.zoneId);
    if (!zoneExists) {
      return ZONE_NOT_FOUND_MESSAGE;
    }

    if (!Number.isInteger(dto.maxPlayers) || dto.maxPlayers < TOURNAMENT_MIN_PLAYERS) {
      return MAX_PLAYERS_MESSAGE;
    }

    if (dto.maxPlayers < registeredCount) {
      return `Max players cannot be less than the ${registeredCount} players already registered.`;
    }

    const validationError =
      dto.entryFee !== undefined && dto.entryFee < 0 ? ENTRY_FEE_MESSAGE : null;

    return validationError;
  }

  private buildTournament(
    tournamentId: string,
    dto: TournamentDto,
    status: TournamentStatus,
  ): Tournament {
    const tournament: Tournament = {
      id: tournamentId,
      name: dto.name.trim(),
      game: dto.game,
      consoleType: dto.consoleType,
      zoneId: dto.zoneId,
      date: dto.date,
      startTime: dto.startTime,
      maxPlayers: dto.maxPlayers,
      entryFee: dto.entryFee,
      prize: dto.prize,
      description: dto.description,
      status,
    };

    return tournament;
  }

  private replaceTournament(updatedTournament: Tournament): void {
    const tournaments = this.storage
      .select('tournaments')
      .map((tournament) =>
        tournament.id === updatedTournament.id ? updatedTournament : tournament,
      );
    this.storage.save('tournaments', tournaments);
  }
}
