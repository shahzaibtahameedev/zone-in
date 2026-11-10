import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '../models';
import { StorageService } from './storage.service';

const SESSION_STORAGE_KEY = 'session';

const EMPTY_SESSION: Session = { role: null, zoneId: null, customerEmail: null };

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storage = inject(StorageService);
  private readonly session = signal<Session>(
    this.storage.readValue(SESSION_STORAGE_KEY, EMPTY_SESSION),
  );

  readonly role = computed(() => this.session().role);
  readonly ownerZoneId = computed(() =>
    this.session().role === 'owner' ? this.session().zoneId : null,
  );
  readonly customerEmail = computed(() =>
    this.session().role === 'customer' ? this.session().customerEmail : null,
  );

  startOwnerSession(zoneId: string): void {
    this.saveSession({ role: 'owner', zoneId, customerEmail: null });
  }

  startAdminSession(): void {
    this.saveSession({ role: 'admin', zoneId: null, customerEmail: null });
  }

  startCustomerSession(): void {
    this.saveSession({ role: 'customer', zoneId: null, customerEmail: null });
  }

  setCustomerEmail(email: string): void {
    this.saveSession({ role: 'customer', zoneId: null, customerEmail: email });
  }

  clearSession(): void {
    this.saveSession(EMPTY_SESSION);
  }

  scopeZoneId(requestedZoneId: string): string {
    const scopedZoneId = this.ownerZoneId() ?? requestedZoneId;

    return scopedZoneId;
  }

  scopeZoneFilter(requestedZoneId: string | undefined): string | undefined {
    const scopedZoneId = this.ownerZoneId() ?? requestedZoneId;

    return scopedZoneId;
  }

  canAccessZone(zoneId: string): boolean {
    const ownerZoneId = this.ownerZoneId();
    const canAccess = ownerZoneId === null || ownerZoneId === zoneId;

    return canAccess;
  }

  private saveSession(session: Session): void {
    this.session.set(session);
    this.storage.writeValue(SESSION_STORAGE_KEY, session);
  }
}
