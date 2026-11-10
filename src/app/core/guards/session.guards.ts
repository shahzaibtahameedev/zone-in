import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_PATHS } from '../config/app-paths';
import { CustomerBookingFlowService } from '../services/customer-booking-flow.service';
import { SessionService } from '../services/session.service';

export const ownerGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const isOwner = session.role() === 'owner' && session.ownerZoneId() !== null;
  const guardResult = isOwner ? true : router.parseUrl(APP_PATHS.roleSelect);

  return guardResult;
};

export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const guardResult = session.role() === 'admin' ? true : router.parseUrl(APP_PATHS.roleSelect);

  return guardResult;
};

export const customerEmailGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const guardResult =
    session.customerEmail() !== null ? true : router.parseUrl(APP_PATHS.customer.enterEmail);

  return guardResult;
};

export const selectedSlotGuard: CanActivateFn = () => {
  const bookingFlow = inject(CustomerBookingFlowService);
  const router = inject(Router);
  const guardResult =
    bookingFlow.selectedSlot() !== null ? true : router.parseUrl(APP_PATHS.customer.browse);

  return guardResult;
};
