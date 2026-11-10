export interface Customer {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface CustomerSummary {
  customer: Customer;
  totalBookings: number;
  lastBookingDate: string | null;
}
