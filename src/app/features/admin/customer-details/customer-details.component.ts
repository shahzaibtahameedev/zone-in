import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCalendarX, LucideUserX } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { BookingsService } from '../../../core/services/bookings.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ZonesService } from '../../../core/services/zones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import {
  DisplayDatePipe,
  DisplayTimePipe,
  OrDashPipe,
  RupeesPipe,
} from '../../../shared/pipes/format.pipes';

const CUSTOMER_FALLBACK_TITLE = 'Customer';

@Component({
  selector: 'app-customer-details',
  imports: [
    RouterLink,
    LucideArrowLeft,
    EmptyStateComponent,
    PageHeaderComponent,
    StatusPillComponent,
    DisplayDatePipe,
    DisplayTimePipe,
    OrDashPipe,
    RupeesPipe,
  ],
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly customersService = inject(CustomersService);
  private readonly zonesService = inject(ZonesService);

  readonly id = input.required<string>();

  protected readonly customersPath = APP_PATHS.admin.customers;
  protected readonly icons = { notFound: LucideUserX, noBookings: LucideCalendarX };
  protected readonly customerSummary = computed(() =>
    this.customersService.getCustomerById(this.id()),
  );

  protected readonly pageTitle = computed(() => {
    const customer = this.customerSummary()?.customer;
    const pageTitle = customer
      ? this.customersService.getDisplayName(customer)
      : CUSTOMER_FALLBACK_TITLE;

    return pageTitle;
  });

  protected readonly bookings = computed(() => {
    const customer = this.customerSummary()?.customer;
    const bookings = customer
      ? this.bookingsService.getBookings({ customerEmail: customer.email })
      : [];

    return bookings;
  });

  protected zoneName(zoneId: string): string {
    const zoneName = this.zonesService.getZoneName(zoneId);

    return zoneName;
  }
}
