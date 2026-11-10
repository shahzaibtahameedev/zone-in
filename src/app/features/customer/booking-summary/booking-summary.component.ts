import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideBanknote,
  LucideCalendarX,
  LucideCircleAlert,
  LucideCreditCard,
  LucideDynamicIcon,
  LucideSmartphone,
} from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { CUSTOMER_SLOT_HOURS, PAYMENT_METHODS } from '../../../core/config/app.constants';
import { Booking, PaymentMethod } from '../../../core/models';
import { AvailabilityService } from '../../../core/services/availability.service';
import { BookingsService } from '../../../core/services/bookings.service';
import { ConsolesService } from '../../../core/services/consoles.service';
import { CustomerBookingFlowService } from '../../../core/services/customer-booking-flow.service';
import { SessionService } from '../../../core/services/session.service';
import { ZonesService } from '../../../core/services/zones.service';
import { formatDisplayDate } from '../../../core/utils/date-time.utils';
import { calculateTotalPrice, formatRupees } from '../../../core/utils/price.utils';
import { formatTimeRange } from '../../../core/utils/time-slot.utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SuccessPanelComponent } from '../../../shared/components/success-panel/success-panel.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayDatePipe, RupeesPipe, TimeRangePipe } from '../../../shared/pipes/format.pipes';

type SummaryState = 'review' | 'slotTaken' | 'confirmed';

interface BookingDetails {
  zoneName: string;
  address: string;
  consoleType: string;
  date: string;
  startTime: string;
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
  email: string;
}

const PAYMENT_ICONS = {
  Cash: LucideBanknote,
  Online: LucideSmartphone,
  Card: LucideCreditCard,
};

@Component({
  selector: 'app-booking-summary',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideCircleAlert,
    LucideDynamicIcon,
    EmptyStateComponent,
    SuccessPanelComponent,
    PageHeaderComponent,
    DisplayDatePipe,
    RupeesPipe,
    TimeRangePipe,
  ],
  templateUrl: './booking-summary.component.html',
})
export class BookingSummaryComponent {
  private readonly availabilityService = inject(AvailabilityService);
  private readonly bookingsService = inject(BookingsService);
  private readonly consolesService = inject(ConsolesService);
  private readonly bookingFlow = inject(CustomerBookingFlowService);
  private readonly session = inject(SessionService);
  private readonly zonesService = inject(ZonesService);
  private readonly router = inject(Router);

  protected readonly browsePath = APP_PATHS.customer.browse;
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly paymentIcons = PAYMENT_ICONS;
  protected readonly slotTakenIcon = LucideCalendarX;
  protected readonly state = signal<SummaryState>('review');
  protected readonly confirmedBooking = signal<Booking | null>(null);
  private readonly confirmedZoneName = signal('');

  protected readonly confirmedSummary = computed(() => {
    const booking = this.confirmedBooking();
    const confirmedSummary = booking
      ? [
          this.confirmedZoneName(),
          booking.consoleType,
          formatDisplayDate(booking.date),
          formatTimeRange(booking.startTime, booking.durationHours),
          formatRupees(booking.totalPrice),
        ].join(' · ')
      : '';

    return confirmedSummary;
  });
  protected readonly bookingError = signal('');

  protected readonly form = new FormGroup({
    paymentMethod: new FormControl<PaymentMethod | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly details = computed<BookingDetails | null>(() => {
    const selection = this.bookingFlow.selectedSlot();
    const email = this.session.customerEmail();
    if (!selection || !email) {
      return null;
    }

    const zone = this.zonesService.getZoneById(selection.zoneId);
    const consoleConfig = this.consolesService.getConsole(selection.zoneId, selection.consoleType);
    if (!zone || !zone.isActive || !consoleConfig) {
      return null;
    }

    const bookingDetails: BookingDetails = {
      zoneName: zone.name,
      address: `${zone.address}, ${zone.area}`,
      consoleType: selection.consoleType,
      date: selection.date,
      startTime: selection.startTime,
      durationHours: CUSTOMER_SLOT_HOURS,
      pricePerHour: consoleConfig.pricePerHour,
      totalPrice: calculateTotalPrice(consoleConfig.pricePerHour, CUSTOMER_SLOT_HOURS),
      email,
    };

    return bookingDetails;
  });

  constructor() {
    if (this.details() === null) {
      void this.router.navigateByUrl(this.browsePath);
    }
  }

  protected bookSlot(): void {
    this.bookingError.set('');
    const selection = this.bookingFlow.selectedSlot();
    const email = this.session.customerEmail();
    const paymentMethod = this.form.controls.paymentMethod.value;
    if (!selection || !email || paymentMethod === '') {
      this.form.markAllAsTouched();

      return;
    }

    const freeUnits = this.availabilityService.getFreeUnits({
      zoneId: selection.zoneId,
      consoleType: selection.consoleType,
      date: selection.date,
      startTime: selection.startTime,
      durationHours: CUSTOMER_SLOT_HOURS,
    });
    if (freeUnits === 0) {
      this.state.set('slotTaken');

      return;
    }

    const result = this.bookingsService.createCustomerBooking(selection, email, paymentMethod);
    if (!result.success) {
      this.bookingError.set(result.error);

      return;
    }

    this.confirmedZoneName.set(this.details()?.zoneName ?? '');
    this.confirmedBooking.set(result.data);
    this.state.set('confirmed');
    this.bookingFlow.clearSelectedSlot();
  }
}
