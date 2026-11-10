import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBan, LucidePencil, LucidePlus, LucidePower, LucideStore } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { GamingZone } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { ZonesService } from '../../../core/services/zones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { RupeesPipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-zones-list',
  imports: [
    RouterLink,
    LucideBan,
    LucidePencil,
    LucidePlus,
    LucidePower,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusPillComponent,
    RupeesPipe,
  ],
  templateUrl: './zones-list.component.html',
})
export class ZonesListComponent {
  private readonly zonesService = inject(ZonesService);
  private readonly toast = inject(ToastService);

  protected readonly paths = APP_PATHS.admin;
  protected readonly emptyIcon = LucideStore;
  protected readonly zoneSummaries = computed(() => this.zonesService.getZoneSummaries());

  protected setZoneActive(zone: GamingZone, isActive: boolean): void {
    const result = this.zonesService.setZoneActive(zone.id, isActive);
    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    this.toast.success(isActive ? `${zone.name} is now active` : `${zone.name} is now inactive`);
  }
}
