import { Injectable, inject, signal } from '@angular/core';
import { SlotSearchFilters, SlotSelection } from '../models';
import { StorageService } from './storage.service';

const FILTERS_STORAGE_KEY = 'customer-filters';
const SELECTION_STORAGE_KEY = 'customer-selection';

@Injectable({ providedIn: 'root' })
export class CustomerBookingFlowService {
  private readonly storage = inject(StorageService);

  readonly searchFilters = signal<SlotSearchFilters | null>(
    this.storage.readValue<SlotSearchFilters | null>(FILTERS_STORAGE_KEY, null),
  );
  readonly selectedSlot = signal<SlotSelection | null>(
    this.storage.readValue<SlotSelection | null>(SELECTION_STORAGE_KEY, null),
  );

  saveSearchFilters(filters: SlotSearchFilters): void {
    this.searchFilters.set(filters);
    this.storage.writeValue(FILTERS_STORAGE_KEY, filters);
  }

  selectSlot(selection: SlotSelection): void {
    this.selectedSlot.set(selection);
    this.storage.writeValue(SELECTION_STORAGE_KEY, selection);
  }

  clearSelectedSlot(): void {
    this.selectedSlot.set(null);
    this.storage.removeValue(SELECTION_STORAGE_KEY);
  }
}
