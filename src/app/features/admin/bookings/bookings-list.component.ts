import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideBan, LucideCalendarX, LucidePencil, LucidePlus, LucideTrash } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { BOOKING_STATUSES, CONSOLE_TYPES } from '../../../core/config/app.constants';
import { Booking } from '../../../core/models';
import { BookingsService } from '../../../core/services/bookings.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDate } from '../../../core/utils/date-time.utils';
import {
  ALL_FILTER_VALUE,
  buildFilterOptions,
  toBookingStatus,
  toConsoleType,
  toOptionalFilter,
} from '../../../core/utils/filter.utils';
import { formValueSignal, toOptionalText } from '../../../core/utils/form.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { DateFilterComponent } from '../../../shared/components/date-filter/date-filter.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FilterChipsComponent } from '../../../shared/components/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import {
  DisplayDatePipe,
  DisplayTimePipe,
  OrDashPipe,
  RupeesPipe,
} from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-bookings-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideBan,
    LucidePencil,
    LucidePlus,
    LucideTrash,
    AvatarComponent,
    DateFilterComponent,
    EmptyStateComponent,
    FilterChipsComponent,
    PageHeaderComponent,
    StatusPillComponent,
    DisplayDatePipe,
    DisplayTimePipe,
    OrDashPipe,
    RupeesPipe,
  ],
  templateUrl: './bookings-list.component.html',
})
export class BookingsListComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly zonesService = inject(ZonesService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly paths = APP_PATHS.admin;
  protected readonly emptyIcon = LucideCalendarX;
  protected readonly consoleTypes = CONSOLE_TYPES;
  protected readonly statusOptions = buildFilterOptions(BOOKING_STATUSES, 'All');
  protected readonly zones = computed(() => this.zonesService.getZones());

  protected readonly selectedDate = signal(ALL_FILTER_VALUE);
  protected readonly selectedStatus = signal(ALL_FILTER_VALUE);

  protected readonly filtersForm = new FormGroup({
    zoneId: new FormControl(ALL_FILTER_VALUE, { nonNullable: true }),
    consoleType: new FormControl(ALL_FILTER_VALUE, { nonNullable: true }),
  });

  private readonly filterValues = formValueSignal(this.filtersForm);

  protected readonly bookings = computed(() => {
    const filterValues = this.filterValues();
    const bookings = this.bookingsService.getBookings({
      date: toOptionalText(this.selectedDate()),
      zoneId: toOptionalFilter(filterValues.zoneId),
      consoleType: toConsoleType(filterValues.consoleType),
      status: toBookingStatus(this.selectedStatus()),
    });

    return bookings;
  });

  protected zoneName(zoneId: string): string {
    const zoneName = this.zonesService.getZoneName(zoneId);

    return zoneName;
  }

  protected async cancelBooking(booking: Booking): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      message: `Cancel the booking for ${booking.customerName} on ${formatDisplayDate(booking.date)}? It will stay in the list as Cancelled.`,
      confirmLabel: 'Cancel Booking',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }

    const result = this.bookingsService.cancelBooking(booking.id);
    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    this.toast.success('Booking cancelled');
  }

  protected async deleteBooking(booking: Booking): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      message: `Delete the booking for ${booking.customerName} on ${formatDisplayDate(booking.date)}? This cannot be undone.`,
      confirmLabel: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }

    const result = this.bookingsService.deleteBooking(booking.id);
    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    this.toast.success('Booking deleted');
  }
}
