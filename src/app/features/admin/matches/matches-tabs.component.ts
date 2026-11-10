import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_PATHS } from '../../../core/config/app-paths';

@Component({
  selector: 'app-matches-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="flex w-fit flex-wrap gap-1 rounded-2xl bg-slate-100 p-1"
      aria-label="1v1 match pages"
    >
      <a
        class="tab-link"
        [routerLink]="paths.matches"
        routerLinkActive="is-active"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
      >
        Match Listings
      </a>
      <a
        class="tab-link"
        [routerLink]="paths.matchReports"
        routerLinkActive="is-active"
        ariaCurrentWhenActive="page"
      >
        Reported Matches
      </a>
    </nav>
  `,
})
export class MatchesTabsComponent {
  protected readonly paths = APP_PATHS.admin;
}
