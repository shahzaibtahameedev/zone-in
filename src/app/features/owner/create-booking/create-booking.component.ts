import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideSave } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import {
  CUSTOMER_NAME_MAX_LENGTH,
  CUSTOMER_NAME_MIN_LENGTH,
  EMPTY_VALUE_LABEL,
  MIN_BOOKING_HOURS,
} from '../../../core/config/app.constants';
import { ConsoleType } from '../../../core/models';
import { BookingsService } from '../../../core/services/bookings.service';
import { ConsolesService } from '../../../core/services/consoles.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { todayIsoDate } from '../../../core/utils/date-time.utils';
import { formValueSignal } from '../../../core/utils/form.utils';
import { calculateTotalPrice, formatRupees } from '../../../core/utils/price.utils';
import { getOpeningHoursHint, getStartTimeOptions } from '../../../core/utils/time-slot.utils';
import {
  endsByClosingTimeValidator,
  notBeforeTodayValidator,
  wholeNumberValidator,
} from '../../../core/validators/form-validators';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayTimePipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-create-booking',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCircleAlert,
    LucideSave,
    FormFieldComponent,
    PageHeaderComponent,
    DisplayTimePipe,
  ],
  templateUrl: './create-booking.component.html',
})
export class CreateBookingComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly consolesService = inject(ConsolesService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly zoneId = this.session.ownerZoneId() ?? '';

  protected readonly dashboardPath = APP_PATHS.owner.dashboard;
  protected readonly today = todayIsoDate();
  protected readonly startTimeOptions = getStartTimeOptions();
  protected readonly openingHoursHint = getOpeningHoursHint();
  protected readonly consoleTypes = computed(() =>
    this.consolesService.getConsoleTypes(this.zoneId),
  );
  protected readonly formError = signal('');

  protected readonly form = new FormGroup({
    customerName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(CUSTOMER_NAME_MIN_LENGTH),
        Validators.maxLength(CUSTOMER_NAME_MAX_LENGTH),
      ],
    }),
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
  });

  private readonly formValue = formValueSignal(this.form);

  protected readonly totalPriceLabel = computed(() => {
    const { consoleType, durationHours } = this.formValue();
    const pricePerHour =
      consoleType === '' ? null : this.bookingsService.getPricePerHour(this.zoneId, consoleType);
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
  }

  protected async saveBooking(): Promise<void> {
    this.formError.set('');
    const value = this.form.getRawValue();
    if (this.form.invalid || value.consoleType === '' || value.durationHours === null) {
      this.form.markAllAsTouched();

      return;
    }

    const result = this.bookingsService.createBooking({
      zoneId: this.zoneId,
      customerName: value.customerName,
      consoleType: value.consoleType,
      date: value.date,
      startTime: value.startTime,
      durationHours: value.durationHours,
      status: 'Confirmed',
    });

    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.toast.success('Booking created');
    await this.router.navigateByUrl(this.dashboardPath);
  }
}
