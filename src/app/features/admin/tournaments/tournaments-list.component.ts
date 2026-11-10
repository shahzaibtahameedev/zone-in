import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBan,
  LucideListChecks,
  LucidePencil,
  LucidePlus,
  LucideSend,
  LucideTrash,
  LucideTrophy,
} from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { ServiceResult, Tournament } from '../../../core/models';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { DisplayDatePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-tournaments-list',
  imports: [
    RouterLink,
    LucideBan,
    LucideListChecks,
    LucidePencil,
    LucidePlus,
    LucideSend,
    LucideTrash,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusPillComponent,
    DisplayDatePipe,
  ],
  templateUrl: './tournaments-list.component.html',
})
export class TournamentsListComponent {
  private readonly tournamentsService = inject(TournamentsService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly paths = APP_PATHS.admin;
  protected readonly emptyIcon = LucideTrophy;
  protected readonly tournaments = computed(() => this.tournamentsService.getTournaments());

  protected publishTournament(tournament: Tournament): void {
    const result = this.tournamentsService.publishTournament(tournament.id);
    this.showResult(result, `${tournament.name} published`);
  }

  protected async cancelTournament(tournament: Tournament): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      message: `Cancel ${tournament.name}? A cancelled tournament cannot be published again.`,
      confirmLabel: 'Cancel Tournament',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }

    const result = this.tournamentsService.cancelTournament(tournament.id);
    this.showResult(result, `${tournament.name} cancelled`);
  }

  protected async deleteTournament(tournament: Tournament): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      message: `Delete ${tournament.name} and all its registrations? This cannot be undone.`,
      confirmLabel: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }

    const result = this.tournamentsService.deleteTournament(tournament.id);
    this.showResult(result, `${tournament.name} deleted`);
  }

  private showResult(result: ServiceResult<Tournament>, successMessage: string): void {
    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    this.toast.success(successMessage);
  }
}
