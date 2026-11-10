import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideClock, LucideMapPin, LucideSearch, LucideSearchX } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { CONSOLE_TYPES, CUSTOMER_SLOT_HOURS } from '../../../core/config/app.constants';
import { AvailableSlot, ConsoleType, SlotSearchFilters } from '../../../core/models';
import { AvailabilityService } from '../../../core/services/availability.service';
import { CustomerBookingFlowService } from '../../../core/services/customer-booking-flow.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDate, todayIsoDate } from '../../../core/utils/date-time.utils';
import {
  ALL_FILTER_VALUE,
  toConsoleType,
  toOptionalFilter,
} from '../../../core/utils/filter.utils';
import { pluralize } from '../../../core/utils/text.utils';
import { formatTimeRange, getCustomerTimeSlots } from '../../../core/utils/time-slot.utils';
import { notBeforeTodayValidator } from '../../../core/validators/form-validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RupeesPipe, TimeRangePipe } from '../../../shared/pipes/format.pipes';

const ALL_AREAS_LABEL = 'All areas';
const ANY_TIME_LABEL = 'Any time';
const ALL_CONSOLES_LABEL = 'All consoles';

@Component({
  selector: 'app-browse',
  imports: [
    ReactiveFormsModule,
    LucideClock,
    LucideMapPin,
    LucideSearch,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    RupeesPipe,
    TimeRangePipe,
  ],
  templateUrl: './browse.component.html',
})
export class BrowseComponent {
  private readonly router = inject(Router);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly bookingFlow = inject(CustomerBookingFlowService);
  private readonly zonesService = inject(ZonesService);

  protected readonly today = todayIsoDate();
  protected readonly slotHours = CUSTOMER_SLOT_HOURS;
  protected readonly consoleTypes = CONSOLE_TYPES;
  protected readonly timeSlots = getCustomerTimeSlots();
  protected readonly emptyIcon = LucideSearchX;
  protected readonly areas = computed(() => this.zonesService.getActiveAreas());

  protected readonly appliedFilters = signal<SlotSearchFilters>(this.getInitialFilters());

  protected readonly form = new FormGroup({
    area: new FormControl(this.appliedFilters().area ?? ALL_FILTER_VALUE, { nonNullable: true }),
    date: new FormControl(this.appliedFilters().date, {
      nonNullable: true,
      validators: [Validators.required, notBeforeTodayValidator],
    }),
    startTime: new FormControl(this.appliedFilters().startTime ?? ALL_FILTER_VALUE, {
      nonNullable: true,
    }),
    consoleType: new FormControl<ConsoleType | ''>(
      this.appliedFilters().consoleType ?? ALL_FILTER_VALUE,
      {
        nonNullable: true,
      },
    ),
  });

  protected readonly results = computed(() =>
    this.availabilityService.searchAvailableSlots(this.appliedFilters()),
  );

  protected readonly resultsHeading = computed(() => {
    const zoneCount = new Set(this.results().map((slot) => slot.zone.id)).size;
    const resultsHeading = `${pluralize(zoneCount, 'gaming zone', 'gaming zones')} available`;

    return resultsHeading;
  });

  protected readonly filtersSummary = computed(() => {
    const filters = this.appliedFilters();
    const timeLabel = filters.startTime
      ? formatTimeRange(filters.startTime, CUSTOMER_SLOT_HOURS)
      : ANY_TIME_LABEL;
    const filtersSummary = [
      filters.area ?? ALL_AREAS_LABEL,
      formatDisplayDate(filters.date),
      timeLabel,
      filters.consoleType ?? ALL_CONSOLES_LABEL,
    ].join(' · ');

    return filtersSummary;
  });

  constructor() {
    this.bookingFlow.saveSearchFilters(this.appliedFilters());
  }

  protected search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const filters: SlotSearchFilters = {
      area: toOptionalFilter(value.area) ?? null,
      date: value.date,
      startTime: toOptionalFilter(value.startTime) ?? null,
      consoleType: toConsoleType(value.consoleType) ?? null,
    };
    this.appliedFilters.set(filters);
    this.bookingFlow.saveSearchFilters(filters);
  }

  protected async selectSlot(slot: AvailableSlot): Promise<void> {
    this.bookingFlow.selectSlot({
      zoneId: slot.zone.id,
      consoleType: slot.consoleType,
      date: slot.date,
      startTime: slot.startTime,
    });
    await this.router.navigateByUrl(APP_PATHS.customer.summary);
  }

  protected slotsLabel(freeUnits: number): string {
    const slotsLabel = `${pluralize(freeUnits, 'slot', 'slots')} available`;

    return slotsLabel;
  }

  private getInitialFilters(): SlotSearchFilters {
    const savedFilters = this.bookingFlow.searchFilters();
    if (savedFilters && savedFilters.date >= this.today) {
      return savedFilters;
    }

    const defaultFilters: SlotSearchFilters = {
      area: null,
      date: this.today,
      startTime: null,
      consoleType: null,
    };

    return defaultFilters;
  }
}
