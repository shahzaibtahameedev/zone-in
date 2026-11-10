import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  LucideCalendarSearch,
  LucideDynamicIcon,
  LucideIconInput,
  LucideSwords,
  LucideTrophy,
} from '@lucide/angular';
import { filter, map } from 'rxjs';
import { APP_PATHS } from '../../core/config/app-paths';
import { SessionService } from '../../core/services/session.service';
import { AppLogoComponent } from '../../shared/components/app-logo/app-logo.component';

interface CustomerTab {
  label: string;
  path: string;
  icon: LucideIconInput;
  sectionPaths: string[];
}

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, LucideDynamicIcon, AppLogoComponent],
  template: `
    <div class="min-h-screen">
      <header class="bg-white ring-1 ring-slate-900/5">
        <div
          class="mx-auto flex min-h-16 max-w-[76rem] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6"
        >
          <a
            [routerLink]="roleSelectPath"
            class="flex min-h-11 items-center rounded-xl focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:outline-none"
            aria-label="Back to role select"
          >
            <app-logo />
          </a>
          @if (showCustomerMenu()) {
            <nav
              class="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto"
              aria-label="Customer menu"
            >
              @for (tab of tabs; track tab.path) {
                <a
                  class="nav-link shrink-0"
                  [class.is-active]="isTabActive(tab)"
                  [attr.aria-current]="isTabActive(tab) ? 'page' : null"
                  [routerLink]="tab.path"
                >
                  <svg [lucideIcon]="tab.icon" class="size-[1.125rem] shrink-0"></svg>
                  {{ tab.label }}
                </a>
              }
            </nav>
            <p class="min-w-0 truncate text-sm text-slate-500">
              Booking as <span class="font-medium text-slate-900">{{ customerEmail() }}</span>
            </p>
          }
        </div>
      </header>
      <main class="mx-auto max-w-[76rem] px-4 py-8 sm:px-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class CustomerLayoutComponent {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  protected readonly roleSelectPath = APP_PATHS.roleSelect;
  protected readonly customerEmail = this.session.customerEmail;
  protected readonly tabs: CustomerTab[] = [
    {
      label: 'Book a Slot',
      path: APP_PATHS.customer.browse,
      icon: LucideCalendarSearch,
      sectionPaths: [APP_PATHS.customer.browse, APP_PATHS.customer.summary],
    },
    {
      label: '1v1 Matches',
      path: APP_PATHS.customer.matches,
      icon: LucideSwords,
      sectionPaths: [APP_PATHS.customer.matches],
    },
    {
      label: 'Tournaments',
      path: APP_PATHS.customer.tournaments,
      icon: LucideTrophy,
      sectionPaths: [APP_PATHS.customer.tournaments],
    },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showCustomerMenu = computed(
    () => this.customerEmail() !== null && this.currentUrl() !== APP_PATHS.customer.enterEmail,
  );

  protected isTabActive(tab: CustomerTab): boolean {
    const isActive = tab.sectionPaths.some((sectionPath) =>
      this.currentUrl().startsWith(sectionPath),
    );

    return isActive;
  }
}
