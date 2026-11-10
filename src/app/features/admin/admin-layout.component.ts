import { Component } from '@angular/core';
import {
  LucideCalendarDays,
  LucideLayoutDashboard,
  LucideStore,
  LucideSwords,
  LucideTrophy,
  LucideUsers,
} from '@lucide/angular';
import { APP_PATHS } from '../../core/config/app-paths';
import { ShellLayoutComponent } from '../../shared/components/shell-layout/shell-layout.component';
import { NavLink } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [ShellLayoutComponent],
  template: `<app-shell-layout [links]="links" profileName="Platform Admin" profileRole="Admin" />`,
})
export class AdminLayoutComponent {
  protected readonly links: NavLink[] = [
    { label: 'Dashboard', path: APP_PATHS.admin.dashboard, icon: LucideLayoutDashboard },
    { label: 'Gaming Zones', path: APP_PATHS.admin.zones, icon: LucideStore },
    { label: 'Bookings', path: APP_PATHS.admin.bookings, icon: LucideCalendarDays },
    { label: 'Customers', path: APP_PATHS.admin.customers, icon: LucideUsers },
    { label: 'Tournaments', path: APP_PATHS.admin.tournaments, icon: LucideTrophy },
    { label: '1v1 Matches', path: APP_PATHS.admin.matches, icon: LucideSwords },
  ];
}
