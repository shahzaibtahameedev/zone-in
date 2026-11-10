import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircleAlert, LucideSwords } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from '../../../core/config/app.constants';
import { Match } from '../../../core/models';
import { CustomersService } from '../../../core/services/customers.service';
import { MatchesService } from '../../../core/services/matches.service';
import { SessionService } from '../../../core/services/session.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDateTime } from '../../../core/utils/date-time.utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SuccessPanelComponent } from '../../../shared/components/success-panel/success-panel.component';
import { DisplayDateTimePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-join-match',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideCircleAlert,
    LucideSwords,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    SuccessPanelComponent,
    DisplayDateTimePipe,
  ],
  templateUrl: './join-match.component.html',
})
export class JoinMatchComponent {
  private readonly matchesService = inject(MatchesService);
  private readonly customersService = inject(CustomersService);
  private readonly zonesService = inject(ZonesService);
  private readonly session = inject(SessionService);

  private readonly customerEmail = this.session.customerEmail() ?? '';

  readonly id = input.required<string>();

  protected readonly matchesPath = APP_PATHS.customer.matches;
  protected readonly emptyIcon = LucideSwords;
  protected readonly joinedMatch = signal<Match | null>(null);
  protected readonly formError = signal('');

  protected readonly matchItem = computed(() => this.matchesService.getMatchById(this.id()));
  protected readonly joinError = computed(() =>
    this.matchesService.getJoinError(this.id(), this.customerEmail),
  );

  protected readonly zoneAddress = computed(() => {
    const zoneId = this.matchItem()?.match.zoneId;
    const zone = zoneId ? this.zonesService.getZoneById(zoneId) : undefined;
    const zoneAddress = zone ? `${zone.address}, ${zone.area}` : '';

    return zoneAddress;
  });

  protected readonly joinedSummary = computed(() => {
    const match = this.joinedMatch();
    const joinedSummary = match
      ? `${match.player1} vs ${match.player2 ?? ''} · ${match.game} · ${this.matchItem()?.zoneName ?? ''} · ${formatDisplayDateTime(match.dateTime)}`
      : '';

    return joinedSummary;
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

  protected joinMatch(): void {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const result = this.matchesService.joinMatch(this.id(), {
      playerName: this.form.controls.playerName.value,
      playerEmail: this.customerEmail,
    });
    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.joinedMatch.set(result.data);
  }
}
