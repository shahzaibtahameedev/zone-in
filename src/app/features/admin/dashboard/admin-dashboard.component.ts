import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  LucideCalendarCheck,
  LucideCalendarX,
  LucideJoystick,
  LucideStore,
  LucideUsers,
  LucideWallet,
} from '@lucide/angular';
import { EMPTY_VALUE_LABEL, RECENT_BOOKINGS_LIMIT } from '../../../core/config/app.constants';
import { BookingFilters } from '../../../core/models';
import { BookingsService } from '../../../core/services/bookings.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDate, startOfMonth, todayIsoDate } from '../../../core/utils/date-time.utils';
import { ALL_FILTER_VALUE, toOptionalFilter } from '../../../core/utils/filter.utils';
import { formValueSignal, toOptionalText } from '../../../core/utils/form.utils';
import { pluralize } from '../../../core/utils/text.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { DisplayDatePipe, DisplayTimePipe, RupeesPipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    ReactiveFormsModule,

    AvatarComponent,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusPillComponent,
    DisplayDatePipe,
    DisplayTimePipe,
    RupeesPipe,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly customersService = inject(CustomersService);
  private readonly zonesService = inject(ZonesService);

  protected readonly today = todayIsoDate();
  protected readonly todayLabel = formatDisplayDate(this.today);
  protected readonly icons = {
    zones: LucideStore,
    bookings: LucideCalendarCheck,
    revenue: LucideWallet,
    customers: LucideUsers,
    console: LucideJoystick,
    empty: LucideCalendarX,
  };

  protected readonly filtersForm = new FormGroup({
    fromDate: new FormControl(startOfMonth(this.today), { nonNullable: true }),
    toDate: new FormControl(this.today, { nonNullable: true }),
    zoneId: new FormControl(ALL_FILTER_VALUE, { nonNullable: true }),
  });

  private readonly filterValues = formValueSignal(this.filtersForm);

  protected readonly zones = computed(() => this.zonesService.getZones());

  private readonly bookingFilters = computed<BookingFilters>(() => {
    const filterValues = this.filterValues();
    const bookingFilters: BookingFilters = {
      fromDate: toOptionalText(filterValues.fromDate),
      toDate: toOptionalText(filterValues.toDate),
      zoneId: toOptionalFilter(filterValues.zoneId),
    };

    return bookingFilters;
  });

  protected readonly stats = computed(() =>
    this.bookingsService.getBookingStats(this.bookingFilters()),
  );

  protected readonly zonesCaption = computed(() => {
    const activeCount = this.zones().filter((zone) => zone.isActive).length;
    const zonesCaption = `${activeCount} active`;

    return zonesCaption;
  });

  protected readonly totalCustomers = computed(() => this.customersService.getCustomers().length);

  protected readonly mostBookedValue = computed(() => {
    const mostBookedValue = this.stats().mostBookedConsole?.consoleType ?? EMPTY_VALUE_LABEL;

    return mostBookedValue;
  });

  protected readonly mostBookedCaption = computed(() => {
    const mostBookedConsole = this.stats().mostBookedConsole;
    const caption = mostBookedConsole
      ? `${pluralize(mostBookedConsole.bookingCount, 'booking', 'bookings')} in this range`
      : 'No bookings in this range';

    return caption;
  });

  protected readonly recentBookings = computed(() => {
    const recentBookings = this.bookingsService.getBookings(
      Object.assign({}, this.bookingFilters(), { limit: RECENT_BOOKINGS_LIMIT }),
    );

    return recentBookings;
  });

  protected zoneName(zoneId: string): string {
    const zoneName = this.zonesService.getZoneName(zoneId);

    return zoneName;
  }
}
