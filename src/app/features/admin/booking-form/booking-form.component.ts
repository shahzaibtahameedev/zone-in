import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCalendarX, LucideCircleAlert, LucideSave } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import {
  BOOKING_STATUSES,
  CUSTOMER_NAME_MAX_LENGTH,
  CUSTOMER_NAME_MIN_LENGTH,
  EMPTY_VALUE_LABEL,
  MIN_BOOKING_HOURS,
  PAYMENT_METHODS,
} from '../../../core/config/app.constants';
import { BookingDto, BookingStatus, ConsoleType, PaymentMethod } from '../../../core/models';
import { BookingsService } from '../../../core/services/bookings.service';
import { ConsolesService } from '../../../core/services/consoles.service';
import { ToastService } from '../../../core/services/toast.service';
import { ZonesService } from '../../../core/services/zones.service';
import { todayIsoDate } from '../../../core/utils/date-time.utils';
import { formValueSignal, toOptionalText } from '../../../core/utils/form.utils';
import { calculateTotalPrice, formatRupees } from '../../../core/utils/price.utils';
import { getOpeningHoursHint, getStartTimeOptions } from '../../../core/utils/time-slot.utils';
import {
  emailFormatValidator,
  endsByClosingTimeValidator,
  notBeforeTodayValidator,
  wholeNumberValidator,
} from '../../../core/validators/form-validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayTimePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-booking-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCircleAlert,
    LucideSave,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    DisplayTimePipe,
  ],
  templateUrl: './booking-form.component.html',
})
export class BookingFormComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly consolesService = inject(ConsolesService);
  private readonly zonesService = inject(ZonesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly bookingsPath = APP_PATHS.admin.bookings;
  protected readonly notFoundIcon = LucideCalendarX;
  protected readonly today = todayIsoDate();
  protected readonly startTimeOptions = getStartTimeOptions();
  protected readonly openingHoursHint = getOpeningHoursHint();
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly bookingStatuses = BOOKING_STATUSES;
  protected readonly isEditing = computed(() => this.id() !== undefined);
  protected readonly pageTitle = computed(() =>
    this.isEditing() ? 'Edit Booking' : 'Create Booking',
  );
  protected readonly isNotFound = signal(false);
  protected readonly formError = signal('');

  private readonly editingZoneId = signal<string | null>(null);

  protected readonly form = new FormGroup({
    zoneId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    customerName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(CUSTOMER_NAME_MIN_LENGTH),
        Validators.maxLength(CUSTOMER_NAME_MAX_LENGTH),
      ],
    }),
    customerEmail: new FormControl('', { nonNullable: true, validators: [emailFormatValidator] }),
    date: new FormControl(this.today, {
      nonNullable: true,
      validators: [Validators.required, notBeforeTodayValidator],
    }),
    startTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    durationHours: new FormControl<number | null>(MIN_BOOKING_HOURS, {
      validators: [
        Validators.required,
        Validators.min(MIN_BOOKING_HOURS),
        wholeNumberValidator,
        endsByClosingTimeValidator('startTime'),
      ],
    }),
    consoleType: new FormControl<ConsoleType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    paymentMethod: new FormControl<PaymentMethod | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<BookingStatus>('Confirmed', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly formValue = formValueSignal(this.form);

  protected readonly zones = computed(() => {
    const editingZoneId = this.editingZoneId();
    const zones = this.zonesService
      .getZones()
      .filter((zone) => zone.isActive || zone.id === editingZoneId);

    return zones;
  });

  protected readonly consoleTypes = computed(() => {
    const zoneId = this.formValue().zoneId;
    const consoleTypes = zoneId ? this.consolesService.getConsoleTypes(zoneId) : [];

    return consoleTypes;
  });

  protected readonly totalPriceLabel = computed(() => {
    const { zoneId, consoleType, durationHours } = this.formValue();
    const pricePerHour =
      zoneId && consoleType !== ''
        ? this.bookingsService.getPricePerHour(zoneId, consoleType, this.id())
        : null;
    const isValidDuration =
      Number.isInteger(durationHours) && Number(durationHours) >= MIN_BOOKING_HOURS;
    const canShowPrice = pricePerHour !== null && isValidDuration;
    const totalPriceLabel = canShowPrice
      ? formatRupees(calculateTotalPrice(pricePerHour, Number(durationHours)))
      : EMPTY_VALUE_LABEL;

    return totalPriceLabel;
  });

  constructor() {
    this.form.controls.startTime.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.durationHours.updateValueAndValidity());

    this.form.controls.zoneId.valueChanges.pipe(takeUntilDestroyed()).subscribe((zoneId) => {
      const consoleType = this.form.controls.consoleType.value;
      const isConsoleAvailable =
        consoleType !== '' && this.consolesService.getConsoleTypes(zoneId).includes(consoleType);
      if (!isConsoleAvailable) {
        this.form.controls.consoleType.setValue('');
      }
    });
  }

  ngOnInit(): void {
    const bookingId = this.id();
    if (bookingId === undefined) {
      return;
    }

    const booking = this.bookingsService.getBookingById(bookingId);
    if (!booking) {
      this.isNotFound.set(true);

      return;
    }

    this.editingZoneId.set(booking.zoneId);
    this.form.controls.date.removeValidators(notBeforeTodayValidator);
    this.form.reset({
      zoneId: booking.zoneId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail ?? '',
      date: booking.date,
      startTime: booking.startTime,
      durationHours: booking.durationHours,
      consoleType: booking.consoleType,
      paymentMethod: booking.paymentMethod ?? '',
      status: booking.status,
    });
  }

  protected async saveBooking(): Promise<void> {
    this.formError.set('');
    const value = this.form.getRawValue();
    if (
      this.form.invalid ||
      value.consoleType === '' ||
      value.paymentMethod === '' ||
      value.durationHours === null
    ) {
      this.form.markAllAsTouched();

      return;
    }

    const bookingId = this.id();
    const dto: BookingDto = {
      zoneId: value.zoneId,
      customerName: value.customerName,
      customerEmail: toOptionalText(value.customerEmail),
      consoleType: value.consoleType,
      date: value.date,
      startTime: value.startTime,
      durationHours: value.durationHours,
      paymentMethod: value.paymentMethod,
      status: bookingId === undefined ? 'Confirmed' : value.status,
    };
    const result =
      bookingId === undefined
        ? this.bookingsService.createBooking(dto)
        : this.bookingsService.updateBooking(bookingId, dto);

    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.toast.success(bookingId === undefined ? 'Booking created' : 'Booking updated');
    await this.router.navigateByUrl(this.bookingsPath);
  }
}
