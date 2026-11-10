import { Component, computed, inject } from '@angular/core';
import { LucideFlag } from '@lucide/angular';
import { MatchesService } from '../../../core/services/matches.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { DisplayDatePipe } from '../../../shared/pipes/format.pipes';
import { MatchesTabsComponent } from '../matches/matches-tabs.component';

@Component({
  selector: 'app-reported-matches',
  imports: [
    EmptyStateComponent,
    MatchesTabsComponent,
    PageHeaderComponent,
    StatusPillComponent,
    DisplayDatePipe,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <app-page-header title="1v1 Matches" description="Matches that players have reported" />

      <app-matches-tabs />

      <section class="card p-0" aria-labelledby="reports-title">
        <div class="p-5">
          <h2 id="reports-title" class="card-title">Reported matches</h2>
        </div>

        @if (reports().length > 0) {
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th scope="col">Game</th>
                  <th scope="col">Players</th>
                  <th scope="col">Reported By</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Reported Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (item of reports(); track item.report.id) {
                  <tr>
                    <td class="font-medium text-slate-900">{{ item.game }}</td>
                    <td>{{ item.players }}</td>
                    <td>{{ item.report.reportedBy }}</td>
                    <td class="min-w-64 whitespace-normal">{{ item.report.reason }}</td>
                    <td>{{ item.report.reportedAt | displayDate }}</td>
                    <td><app-status-pill [status]="item.report.status" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="border-t border-slate-100">
            <app-empty-state [icon]="emptyIcon" message="No reported matches." />
          </div>
        }
      </section>
    </div>
  `,
})
export class ReportedMatchesComponent {
  private readonly matchesService = inject(MatchesService);

  protected readonly emptyIcon = LucideFlag;
  protected readonly reports = computed(() => this.matchesService.getMatchReports());
}
