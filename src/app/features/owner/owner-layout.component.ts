import { Component, computed, inject } from '@angular/core';
import {
  LucideCalendarPlus,
  LucideLayoutDashboard,
  LucideSlidersHorizontal,
} from '@lucide/angular';
import { APP_PATHS } from '../../core/config/app-paths';
import { SessionService } from '../../core/services/session.service';
import { ZonesService } from '../../core/services/zones.service';
import { ShellLayoutComponent } from '../../shared/components/shell-layout/shell-layout.component';
import { NavLink } from '../../shared/components/sidebar/sidebar.component';

const FALLBACK_ZONE_NAME = 'Gaming zone';

@Component({
  selector: 'app-owner-layout',
  imports: [ShellLayoutComponent],
  template: `<app-shell-layout [links]="links" [profileName]="zoneName()" profileRole="Owner" />`,
})
export class OwnerLayoutComponent {
  private readonly session = inject(SessionService);
  private readonly zonesService = inject(ZonesService);

  protected readonly links: NavLink[] = [
    { label: 'Dashboard', path: APP_PATHS.owner.dashboard, icon: LucideLayoutDashboard },
    { label: 'Create Booking', path: APP_PATHS.owner.createBooking, icon: LucideCalendarPlus },
    { label: 'Consoles & Pricing', path: APP_PATHS.owner.consoles, icon: LucideSlidersHorizontal },
  ];

  protected readonly zoneName = computed(() => {
    const zoneId = this.session.ownerZoneId();
    const zone = zoneId ? this.zonesService.getZoneById(zoneId) : undefined;
    const zoneName = zone?.name ?? FALLBACK_ZONE_NAME;

    return zoneName;
  });
}
