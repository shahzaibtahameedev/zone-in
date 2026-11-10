import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircleAlert, LucideTrophy } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from '../../../core/config/app.constants';
import { CustomersService } from '../../../core/services/customers.service';
import { SessionService } from '../../../core/services/session.service';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDate, formatDisplayTime } from '../../../core/utils/date-time.utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SuccessPanelComponent } from '../../../shared/components/success-panel/success-panel.component';
import {
  DisplayDatePipe,
  DisplayTimePipe,
  OrDashPipe,
  RupeesPipe,
} from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-enroll-tournament',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideCircleAlert,
    LucideTrophy,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    SuccessPanelComponent,
    DisplayDatePipe,
    DisplayTimePipe,
    OrDashPipe,
    RupeesPipe,
  ],
  templateUrl: './enroll-tournament.component.html',
})
export class EnrollTournamentComponent {
  private readonly tournamentsService = inject(TournamentsService);
  private readonly customersService = inject(CustomersService);
  private readonly zonesService = inject(ZonesService);
  private readonly session = inject(SessionService);

  private readonly customerEmail = this.session.customerEmail() ?? '';

  readonly id = input.required<string>();

  protected readonly tournamentsPath = APP_PATHS.customer.tournaments;
  protected readonly emptyIcon = LucideTrophy;
  protected readonly isEnrolledNow = signal(false);
  protected readonly formError = signal('');

  protected readonly tournament = computed(() =>
    this.tournamentsService.getTournamentById(this.id()),
  );
  protected readonly enrollError = computed(() =>
    this.tournamentsService.getEnrollError(this.id(), this.customerEmail),
  );
  protected readonly registeredCount = computed(() =>
    this.tournamentsService.getRegistrationCount(this.id()),
  );
  protected readonly zoneName = computed(() => {
    const zoneId = this.tournament()?.zoneId;
    const zoneName = zoneId ? this.zonesService.getZoneName(zoneId) : '';

    return zoneName;
  });

  protected readonly enrolledSummary = computed(() => {
    const tournament = this.tournament();
    const enrolledSummary = tournament
      ? `${tournament.name} · ${this.zoneName()} · ${formatDisplayDate(tournament.date)}, ${formatDisplayTime(tournament.startTime)}`
      : '';

    return enrolledSummary;
  });

  protected readonly form = new FormGroup({
    playerName: new FormControl(
      this.customersService.getCustomerByEmail(this.customerEmail)?.name ?? '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(PLAYER_NAME_MIN_LENGTH),
          Validators.maxLength(PLAYER_NAME_MAX_LENGTH),
        ],
      },
    ),
  });

  protected enroll(): void {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const result = this.tournamentsService.enrollPlayer(this.id(), {
      playerName: this.form.controls.playerName.value,
      email: this.customerEmail,
    });
    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.isEnrolledNow.set(true);
  }
}
