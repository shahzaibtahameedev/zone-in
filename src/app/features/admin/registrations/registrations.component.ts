import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideTrophy, LucideUserPlus } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayDatePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-registrations',
  imports: [
    RouterLink,
    LucideArrowLeft,
    AvatarComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    DisplayDatePipe,
  ],
  templateUrl: './registrations.component.html',
})
export class RegistrationsComponent {
  private readonly tournamentsService = inject(TournamentsService);

  readonly id = input.required<string>();

  protected readonly tournamentsPath = APP_PATHS.admin.tournaments;
  protected readonly icons = { notFound: LucideTrophy, empty: LucideUserPlus };
  protected readonly tournament = computed(() =>
    this.tournamentsService.getTournamentById(this.id()),
  );
  protected readonly registrations = computed(() =>
    this.tournamentsService.getRegistrations(this.id()),
  );

  protected readonly tableTitle = computed(() => {
    const maxPlayers = this.tournament()?.maxPlayers ?? 0;
    const tableTitle = `${this.registrations().length} of ${maxPlayers} places filled`;

    return tableTitle;
  });
}
