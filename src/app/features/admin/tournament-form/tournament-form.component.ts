import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideSave, LucideSend, LucideTrophy } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import {
  CONSOLE_TYPES,
  GAMES,
  TOURNAMENT_MIN_PLAYERS,
  TOURNAMENT_NAME_MAX_LENGTH,
  TOURNAMENT_NAME_MIN_LENGTH,
} from '../../../core/config/app.constants';
import {
  ConsoleType,
  TournamentDto,
  TournamentSaveStatus,
  TournamentStatus,
} from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { ZonesService } from '../../../core/services/zones.service';
import { todayIsoDate } from '../../../core/utils/date-time.utils';
import { toOptionalText } from '../../../core/utils/form.utils';
import {
  minimumValueValidator,
  notBeforeTodayValidator,
  wholeNumberValidator,
} from '../../../core/validators/form-validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const MIN_ENTRY_FEE = 0;

@Component({
  selector: 'app-tournament-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCircleAlert,
    LucideSave,
    LucideSend,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
  ],
  templateUrl: './tournament-form.component.html',
})
export class TournamentFormComponent implements OnInit {
  private readonly tournamentsService = inject(TournamentsService);
  private readonly zonesService = inject(ZonesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly tournamentsPath = APP_PATHS.admin.tournaments;
  protected readonly notFoundIcon = LucideTrophy;
  protected readonly today = todayIsoDate();
  protected readonly games = GAMES;
  protected readonly consoleTypes = CONSOLE_TYPES;
  protected readonly isEditing = computed(() => this.id() !== undefined);
  protected readonly pageTitle = computed(() =>
    this.isEditing() ? 'Edit Tournament' : 'Create Tournament',
  );
  protected readonly isNotFound = signal(false);
  protected readonly formError = signal('');
  protected readonly existingStatus = signal<TournamentStatus | null>(null);
  protected readonly isCancelled = computed(() => this.existingStatus() === 'Cancelled');

  private readonly registeredCount = signal(0);
  private readonly editingZoneId = signal<string | null>(null);

  protected readonly zones = computed(() => {
    const editingZoneId = this.editingZoneId();
    const zones = this.zonesService
      .getZones()
      .filter((zone) => zone.isActive || zone.id === editingZoneId);

    return zones;
  });

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(TOURNAMENT_NAME_MIN_LENGTH),
        Validators.maxLength(TOURNAMENT_NAME_MAX_LENGTH),
      ],
    }),
    game: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    consoleType: new FormControl<ConsoleType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    zoneId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(this.today, {
      nonNullable: true,
      validators: [Validators.required, notBeforeTodayValidator],
    }),
    startTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    maxPlayers: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(TOURNAMENT_MIN_PLAYERS),
        wholeNumberValidator,
        minimumValueValidator(
          () => this.registeredCount(),
          'Cannot be less than the number of players already registered.',
        ),
      ],
    }),
    entryFee: new FormControl<number | null>(null, { validators: [Validators.min(MIN_ENTRY_FEE)] }),
    prize: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const tournamentId = this.id();
    if (tournamentId === undefined) {
      return;
    }

    const tournament = this.tournamentsService.getTournamentById(tournamentId);
    if (!tournament) {
      this.isNotFound.set(true);

      return;
    }

    this.existingStatus.set(tournament.status);
    this.editingZoneId.set(tournament.zoneId);
    this.registeredCount.set(this.tournamentsService.getRegistrationCount(tournamentId));
    this.form.reset({
      name: tournament.name,
      game: tournament.game,
      consoleType: tournament.consoleType,
      zoneId: tournament.zoneId,
      date: tournament.date,
      startTime: tournament.startTime,
      maxPlayers: tournament.maxPlayers,
      entryFee: tournament.entryFee ?? null,
      prize: tournament.prize ?? '',
      description: tournament.description ?? '',
    });
  }

  protected async saveTournament(status: TournamentSaveStatus): Promise<void> {
    this.formError.set('');
    const value = this.form.getRawValue();
    if (this.form.invalid || value.consoleType === '' || value.maxPlayers === null) {
      this.form.markAllAsTouched();

      return;
    }

    const dto: TournamentDto = {
      name: value.name,
      game: value.game,
      consoleType: value.consoleType,
      zoneId: value.zoneId,
      date: value.date,
      startTime: value.startTime,
      maxPlayers: value.maxPlayers,
      entryFee: value.entryFee ?? undefined,
      prize: toOptionalText(value.prize),
      description: toOptionalText(value.description),
    };
    const tournamentId = this.id();
    const result =
      tournamentId === undefined
        ? this.tournamentsService.createTournament(dto, status)
        : this.tournamentsService.updateTournament(tournamentId, dto, status);

    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.toast.success(`${result.data.name} saved as ${result.data.status}`);
    await this.router.navigateByUrl(this.tournamentsPath);
  }
}
