import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarClock, LucideMapPin, LucidePlus, LucideSwords } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { GAMES } from '../../../core/config/app.constants';
import { MatchListItem } from '../../../core/models';
import { MatchesService } from '../../../core/services/matches.service';
import { SessionService } from '../../../core/services/session.service';
import { buildFilterOptions, toOptionalFilter } from '../../../core/utils/filter.utils';
import { normalizeEmail } from '../../../core/utils/id.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FilterChipsComponent } from '../../../shared/components/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayDateTimePipe } from '../../../shared/pipes/format.pipes';

const ALL_GAMES_LABEL = 'All games';

@Component({
  selector: 'app-customer-matches',
  imports: [
    RouterLink,
    LucideCalendarClock,
    LucideMapPin,
    LucidePlus,
    LucideSwords,
    AvatarComponent,
    EmptyStateComponent,
    FilterChipsComponent,
    PageHeaderComponent,
    DisplayDateTimePipe,
  ],
  templateUrl: './customer-matches.component.html',
})
export class CustomerMatchesComponent {
  private readonly matchesService = inject(MatchesService);
  private readonly session = inject(SessionService);

  private readonly customerEmail = this.session.customerEmail() ?? '';

  protected readonly paths = APP_PATHS.customer;
  protected readonly emptyIcon = LucideSwords;
  protected readonly gameOptions = buildFilterOptions(GAMES, ALL_GAMES_LABEL);
  protected readonly selectedGame = signal('');

  protected readonly openMatches = computed(() => {
    const selectedGame = toOptionalFilter(this.selectedGame()) ?? null;
    const openMatches = this.matchesService.getOpenMatches(this.customerEmail, selectedGame);

    return openMatches;
  });

  protected readonly myMatches = computed(() =>
    this.matchesService.getCustomerMatches(this.customerEmail),
  );

  protected opponentName(item: MatchListItem): string | null {
    const isCreator =
      normalizeEmail(item.match.player1Email ?? '') === normalizeEmail(this.customerEmail);
    const opponentName = isCreator ? (item.match.player2 ?? null) : item.match.player1;

    return opponentName;
  }
}
