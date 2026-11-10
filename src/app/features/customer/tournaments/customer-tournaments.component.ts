import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarClock,
  LucideCircleCheck,
  LucideGift,
  LucideMapPin,
  LucideTicket,
  LucideTrophy,
} from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { OpenTournamentItem } from '../../../core/models';
import { SessionService } from '../../../core/services/session.service';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { formatRupees } from '../../../core/utils/price.utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayDatePipe, DisplayTimePipe } from '../../../shared/pipes/format.pipes';

const FREE_ENTRY_LABEL = 'Free entry';
const FULL_PERCENT = 100;

@Component({
  selector: 'app-customer-tournaments',
  imports: [
    RouterLink,
    LucideCalendarClock,
    LucideCircleCheck,
    LucideGift,
    LucideMapPin,
    LucideTicket,
    EmptyStateComponent,
    PageHeaderComponent,
    DisplayDatePipe,
    DisplayTimePipe,
  ],
  templateUrl: './customer-tournaments.component.html',
})
export class CustomerTournamentsComponent {
  private readonly tournamentsService = inject(TournamentsService);
  private readonly session = inject(SessionService);

  protected readonly paths = APP_PATHS.customer;
  protected readonly emptyIcon = LucideTrophy;
  protected readonly tournaments = computed(() =>
    this.tournamentsService.getOpenTournaments(this.session.customerEmail() ?? ''),
  );

  protected entryFeeLabel(item: OpenTournamentItem): string {
    const entryFee = item.tournament.entryFee ?? 0;
    const entryFeeLabel = entryFee > 0 ? `${formatRupees(entryFee)} entry` : FREE_ENTRY_LABEL;

    return entryFeeLabel;
  }

  protected filledPercent(item: OpenTournamentItem): number {
    const filledPercent = Math.min(
      FULL_PERCENT,
      (item.registeredCount / item.tournament.maxPlayers) * FULL_PERCENT,
    );

    return filledPercent;
  }
}
