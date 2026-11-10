import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideSwords } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import {
  GAMES,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '../../../core/config/app.constants';
import { CustomersService } from '../../../core/services/customers.service';
import { MatchesService } from '../../../core/services/matches.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { ZonesService } from '../../../core/services/zones.service';
import { todayIsoDate } from '../../../core/utils/date-time.utils';
import { getOpeningHoursHint, getStartTimeOptions } from '../../../core/utils/time-slot.utils';
import { notBeforeTodayValidator } from '../../../core/validators/form-validators';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayTimePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-create-match',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCircleAlert,
    LucideSwords,
    FormFieldComponent,
    PageHeaderComponent,
    DisplayTimePipe,
  ],
  templateUrl: './create-match.component.html',
})
export class CreateMatchComponent {
  private readonly matchesService = inject(MatchesService);
  private readonly customersService = inject(CustomersService);
  private readonly zonesService = inject(ZonesService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly customerEmail = this.session.customerEmail() ?? '';

  protected readonly matchesPath = APP_PATHS.customer.matches;
  protected readonly games = GAMES;
  protected readonly today = todayIsoDate();
  protected readonly startTimeOptions = getStartTimeOptions();
  protected readonly openingHoursHint = getOpeningHoursHint();
  protected readonly zones = computed(() => this.zonesService.getZones({ activeOnly: true }));
  protected readonly formError = signal('');

  protected readonly form = new FormGroup({
    game: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    zoneId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(this.today, {
      nonNullable: true,
      validators: [Validators.required, notBeforeTodayValidator],
    }),
    startTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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

  protected async createMatch(): Promise<void> {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const result = this.matchesService.createMatch({
      game: value.game,
      zoneId: value.zoneId,
      date: value.date,
      startTime: value.startTime,
      playerName: value.playerName,
      playerEmail: this.customerEmail,
    });

    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.toast.success('Your 1v1 slot is live. Other players can now join.');
    await this.router.navigateByUrl(this.matchesPath);
  }
}
