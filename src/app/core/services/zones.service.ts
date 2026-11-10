import { Injectable, inject } from '@angular/core';
import {
  GamingZone,
  GamingZoneDto,
  GamingZoneFilters,
  GamingZoneSummary,
  ServiceResult,
  fail,
  succeed,
} from '../models';
import { summarizeBookings } from '../utils/booking-stats.utils';
import { createId } from '../utils/id.utils';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

const ZONE_ID_PREFIX = 'zone';
const ZONE_NOT_FOUND_MESSAGE = 'Gaming zone not found.';
const NAME_TAKEN_MESSAGE = 'A gaming zone with this name already exists.';
const ADMIN_ONLY_MESSAGE = 'Only an admin can add gaming zones.';
const UNKNOWN_ZONE_NAME = 'Unknown gaming zone';

@Injectable({ providedIn: 'root' })
export class ZonesService {
  private readonly storage = inject(StorageService);
  private readonly session = inject(SessionService);

  getZones(filters: GamingZoneFilters = {}): GamingZone[] {
    const zones = this.storage
      .select('zones')
      .filter((zone) => !filters.activeOnly || zone.isActive)
      .sort((first, second) => first.name.localeCompare(second.name));

    return zones;
  }

  getZoneById(zoneId: string): GamingZone | undefined {
    const zone = this.storage
      .select('zones')
      .find((item) => item.id === zoneId && this.session.canAccessZone(item.id));

    return zone;
  }

  getZoneName(zoneId: string): string {
    const zoneName = this.getZoneById(zoneId)?.name ?? UNKNOWN_ZONE_NAME;

    return zoneName;
  }

  getActiveAreas(): string[] {
    const areas = this.getZones({ activeOnly: true }).map((zone) => zone.area);
    const uniqueAreas = Array.from(new Set(areas)).sort();

    return uniqueAreas;
  }

  getZoneSummaries(): GamingZoneSummary[] {
    const bookings = this.storage.select('bookings');

    const zoneSummaries = this.getZones().map((zone) => {
      const zoneStats = summarizeBookings(bookings.filter((booking) => booking.zoneId === zone.id));
      const zoneSummary: GamingZoneSummary = {
        zone,
        totalBookings: zoneStats.totalBookings,
        totalRevenue: zoneStats.totalRevenue,
      };

      return zoneSummary;
    });

    return zoneSummaries;
  }

  isZoneNameTaken(name: string, excludeZoneId?: string): boolean {
    const normalizedName = name.trim().toLowerCase();
    const isTaken = this.storage
      .select('zones')
      .some(
        (zone) => zone.id !== excludeZoneId && zone.name.trim().toLowerCase() === normalizedName,
      );

    return isTaken;
  }

  createZone(dto: GamingZoneDto): ServiceResult<GamingZone> {
    const validationError = this.validateNewZone(dto);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const zone = this.buildZone(createId(ZONE_ID_PREFIX), dto);
    this.storage.save('zones', this.storage.select('zones').concat(zone));
    const result = succeed(zone);

    return result;
  }

  updateZone(zoneId: string, dto: GamingZoneDto): ServiceResult<GamingZone> {
    const validationError = this.validateExistingZone(zoneId, dto.name);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const updatedZone = this.buildZone(zoneId, dto);
    this.replaceZone(updatedZone);
    const result = succeed(updatedZone);

    return result;
  }

  setZoneActive(zoneId: string, isActive: boolean): ServiceResult<GamingZone> {
    const zone = this.getZoneById(zoneId);
    if (!zone) {
      const failure = fail(ZONE_NOT_FOUND_MESSAGE);

      return failure;
    }

    const updatedZone: GamingZone = Object.assign({}, zone, { isActive });
    this.replaceZone(updatedZone);
    const result = succeed(updatedZone);

    return result;
  }

  private validateNewZone(dto: GamingZoneDto): string | null {
    if (this.session.role() === 'owner') {
      return ADMIN_ONLY_MESSAGE;
    }

    const validationError = this.isZoneNameTaken(dto.name) ? NAME_TAKEN_MESSAGE : null;

    return validationError;
  }

  private validateExistingZone(zoneId: string, name: string): string | null {
    if (!this.getZoneById(zoneId)) {
      return ZONE_NOT_FOUND_MESSAGE;
    }

    const validationError = this.isZoneNameTaken(name, zoneId) ? NAME_TAKEN_MESSAGE : null;

    return validationError;
  }

  private buildZone(zoneId: string, dto: GamingZoneDto): GamingZone {
    const zone: GamingZone = {
      id: zoneId,
      name: dto.name.trim(),
      address: dto.address.trim(),
      area: dto.area,
      contactNumber: dto.contactNumber.trim(),
      contactEmail: dto.contactEmail,
      facilities: dto.facilities.trim(),
      isActive: dto.isActive,
    };

    return zone;
  }

  private replaceZone(updatedZone: GamingZone): void {
    const zones = this.storage
      .select('zones')
      .map((zone) => (zone.id === updatedZone.id ? updatedZone : zone));
    this.storage.save('zones', zones);
  }
}
