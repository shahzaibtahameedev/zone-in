import { Injectable, inject } from '@angular/core';
import { Customer, CustomerSummary } from '../models';
import { createId, normalizeEmail } from '../utils/id.utils';
import { StorageService } from './storage.service';

const CUSTOMER_ID_PREFIX = 'customer';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly storage = inject(StorageService);

  getCustomers(searchTerm = ''): CustomerSummary[] {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const customerSummaries = this.storage
      .select('customers')
      .filter((customer) => {
        const searchableText = `${customer.name ?? ''} ${customer.email}`.toLowerCase();
        const matchesSearch = searchableText.includes(normalizedSearch);

        return matchesSearch;
      })
      .map((customer) => this.buildSummary(customer))
      .sort((first, second) =>
        this.getDisplayName(first.customer).localeCompare(this.getDisplayName(second.customer)),
      );

    return customerSummaries;
  }

  getCustomerById(customerId: string): CustomerSummary | undefined {
    const customer = this.storage.select('customers').find((item) => item.id === customerId);
    const customerSummary = customer ? this.buildSummary(customer) : undefined;

    return customerSummary;
  }

  getCustomerByEmail(email: string): Customer | undefined {
    const normalizedEmail = normalizeEmail(email);
    const customer = this.storage
      .select('customers')
      .find((item) => normalizeEmail(item.email) === normalizedEmail);

    return customer;
  }

  findOrCreateCustomer(email: string, name?: string): Customer {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name?.trim() ?? '';
    const hasRealName = trimmedName !== '' && trimmedName.toLowerCase() !== normalizedEmail;
    const existingCustomer = this.getCustomerByEmail(normalizedEmail);

    if (existingCustomer) {
      const updatedCustomer: Customer = hasRealName
        ? Object.assign({}, existingCustomer, { name: trimmedName })
        : existingCustomer;
      const customers = this.storage
        .select('customers')
        .map((customer) => (customer.id === existingCustomer.id ? updatedCustomer : customer));
      this.storage.save('customers', customers);

      return updatedCustomer;
    }

    const newCustomer: Customer = {
      id: createId(CUSTOMER_ID_PREFIX),
      email: normalizedEmail,
      name: hasRealName ? trimmedName : undefined,
      createdAt: new Date().toISOString(),
    };
    this.storage.save('customers', this.storage.select('customers').concat(newCustomer));

    return newCustomer;
  }

  getDisplayName(customer: Customer): string {
    const displayName = customer.name ?? customer.email;

    return displayName;
  }

  private buildSummary(customer: Customer): CustomerSummary {
    const customerEmail = normalizeEmail(customer.email);
    const customerBookings = this.storage
      .select('bookings')
      .filter(
        (booking) =>
          booking.customerEmail !== undefined &&
          normalizeEmail(booking.customerEmail) === customerEmail,
      );
    const confirmedCount = customerBookings.filter(
      (booking) => booking.status === 'Confirmed',
    ).length;
    const bookingDates = customerBookings.map((booking) => booking.date).sort();
    const lastBookingDate = bookingDates.length > 0 ? bookingDates[bookingDates.length - 1] : null;

    const customerSummary: CustomerSummary = {
      customer,
      totalBookings: confirmedCount,
      lastBookingDate,
    };

    return customerSummary;
  }
}
