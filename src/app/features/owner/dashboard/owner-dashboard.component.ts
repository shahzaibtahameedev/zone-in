import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarCheck,
  LucideCalendarX,
  LucideJoystick,
  LucidePlus,
  LucideWallet,
} from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { CONSOLE_TYPES, EMPTY_VALUE_LABEL } from '../../../core/config/app.constants';
import { BookingsService } from '../../../core/services/bookings.service';
import { SessionService } from '../../../core/services/session.service';
import { ZonesService } from '../../../core/services/zones.service';
import {
  endOfMonth,
  formatDisplayDate,
  startOfMonth,
  todayIsoDate,
} from '../../../core/utils/date-time.utils';
import {
  ALL_FILTER_VALUE,
  buildFilterOptions,
  toConsoleType,
} from '../../../core/utils/filter.utils';
import { pluralize } from '../../../core/utils/text.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { DateFilterComponent } from '../../../shared/components/date-filter/date-filter.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FilterChipsComponent } from '../../../shared/components/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import {
  DisplayDatePipe,
  DisplayTimePipe,
  OrDashPipe,
  RupeesPipe,
} from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-owner-dashboard',
  imports: [
    RouterLink,
    LucidePlus,
    AvatarComponent,
    DateFilterComponent,
    EmptyStateComponent,
    FilterChipsComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusPillComponent,
    DisplayDatePipe,
    DisplayTimePipe,
    OrDashPipe,
    RupeesPipe,
  ],
  templateUrl: './owner-dashboard.component.html',
})
export class OwnerDashboardComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly session = inject(SessionService);
  private readonly zonesService = inject(ZonesService);

  protected readonly createBookingPath = APP_PATHS.owner.createBooking;
  protected readonly icons = {
    bookings: LucideCalendarCheck,
    revenue: LucideWallet,
    console: LucideJoystick,
    empty: LucideCalendarX,
  };
  protected readonly today = todayIsoDate();
  protected readonly consoleOptions = buildFilterOptions(CONSOLE_TYPES, 'All');

  protected readonly selectedDate = signal(this.today);
  protected readonly selectedConsole = signal(ALL_FILTER_VALUE);

  private readonly zoneId = computed(() => this.session.ownerZoneId() ?? undefined);

  protected readonly headerContext = computed(() => {
    const zoneId = this.zoneId();
    const zoneName = zoneId ? this.zonesService.getZoneById(zoneId)?.name : undefined;
    const headerContext = [zoneName, formatDisplayDate(this.today)].filter(Boolean).join(' · ');

    return headerContext;
  });

  protected readonly monthStats = computed(() => {
    const monthStats = this.bookingsService.getBookingStats({
      zoneId: this.zoneId(),
      fromDate: startOfMonth(this.today),
      toDate: endOfMonth(this.today),
    });

    return monthStats;
  });

  protected readonly mostBookedValue = computed(() => {
    const mostBookedValue = this.monthStats().mostBookedConsole?.consoleType ?? EMPTY_VALUE_LABEL;

    return mostBookedValue;
  });

  protected readonly mostBookedCaption = computed(() => {
    const mostBookedConsole = this.monthStats().mostBookedConsole;
    const caption = mostBookedConsole
      ? `${pluralize(mostBookedConsole.bookingCount, 'booking', 'bookings')} this month`
      : 'No bookings this month yet';

    return caption;
  });

  protected readonly bookings = computed(() => {
    const bookings = this.bookingsService.getBookings({
      zoneId: this.zoneId(),
      date: this.selectedDate(),
      consoleType: toConsoleType(this.selectedConsole()),
      sortBy: 'startTime',
    });

    return bookings;
  });

  protected readonly listTitle = computed(() => {
    const isToday = this.selectedDate() === this.today;
    const listTitle = isToday
      ? "Today's bookings"
      : `Bookings – ${formatDisplayDate(this.selectedDate())}`;

    return listTitle;
  });
}
