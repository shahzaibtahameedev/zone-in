import { Component, computed, inject, signal } from '@angular/core';
import { LucideSwords } from '@lucide/angular';
import { MatchStatus } from '../../../core/models';
import { MatchesService } from '../../../core/services/matches.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FilterChipsComponent } from '../../../shared/components/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { DisplayDateTimePipe } from '../../../shared/pipes/format.pipes';
import { MatchesTabsComponent } from './matches-tabs.component';

const ACTIVE_STATUS: MatchStatus = 'Active';
const COMPLETED_STATUS: MatchStatus = 'Completed';

@Component({
  selector: 'app-matches',
  imports: [
    EmptyStateComponent,
    FilterChipsComponent,
    MatchesTabsComponent,
    PageHeaderComponent,
    StatusPillComponent,
    DisplayDateTimePipe,
  ],
  templateUrl: './matches.component.html',
})
export class MatchesComponent {
  private readonly matchesService = inject(MatchesService);

  protected readonly emptyIcon = LucideSwords;
  protected readonly statusOptions = [
    { label: ACTIVE_STATUS, value: ACTIVE_STATUS },
    { label: COMPLETED_STATUS, value: COMPLETED_STATUS },
  ];
  protected readonly selectedStatus = signal<string>(ACTIVE_STATUS);
  protected readonly isCompletedView = computed(() => this.selectedStatus() === COMPLETED_STATUS);

  protected readonly matches = computed(() => {
    const status = this.isCompletedView() ? COMPLETED_STATUS : ACTIVE_STATUS;
    const matches = this.matchesService.getMatches(status);

    return matches;
  });
}
