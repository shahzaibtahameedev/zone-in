import { Injectable, inject } from '@angular/core';
import { CONSOLE_TYPES, MIN_CONSOLE_QUANTITY } from '../config/app.constants';
import {
  ConsoleConfig,
  ConsoleConfigDto,
  ConsoleConfigUpdateDto,
  ConsoleType,
  ServiceResult,
  fail,
  succeed,
} from '../models';
import { isInPast } from '../utils/date-time.utils';
import { createId } from '../utils/id.utils';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

const CONSOLE_ID_PREFIX = 'console';
const CONSOLE_NOT_FOUND_MESSAGE = 'Console not found.';
const DUPLICATE_CONSOLE_MESSAGE =
  'This console type is already set up. Edit the existing row instead.';
const QUANTITY_MESSAGE = 'Quantity must be a whole number, at least 1.';
const PRICE_MESSAGE = 'Price per hour must be more than 0.';
const ZONE_NOT_FOUND_MESSAGE = 'Gaming zone not found.';

@Injectable({ providedIn: 'root' })
export class ConsolesService {
  private readonly storage = inject(StorageService);
  private readonly session = inject(SessionService);

  getConsoles(zoneId: string): ConsoleConfig[] {
    const scopedZoneId = this.session.scopeZoneId(zoneId);
    const consoles = this.storage
      .select('consoles')
      .filter((config) => config.zoneId === scopedZoneId)
      .sort(
        (first, second) =>
          CONSOLE_TYPES.indexOf(first.consoleType) - CONSOLE_TYPES.indexOf(second.consoleType),
      );

    return consoles;
  }

  getConsoleTypes(zoneId: string): ConsoleType[] {
    const consoleTypes = this.getConsoles(zoneId).map((config) => config.consoleType);

    return consoleTypes;
  }

  getConsole(zoneId: string, consoleType: ConsoleType): ConsoleConfig | undefined {
    const consoleConfig = this.getConsoles(zoneId).find(
      (config) => config.consoleType === consoleType,
    );

    return consoleConfig;
  }

  addConsole(dto: ConsoleConfigDto): ServiceResult<ConsoleConfig> {
    const zoneId = this.session.scopeZoneId(dto.zoneId);
    const validationError = this.validateNewConsole(zoneId, dto);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const consoleConfig: ConsoleConfig = {
      id: createId(CONSOLE_ID_PREFIX),
      zoneId,
      consoleType: dto.consoleType,
      quantity: dto.quantity,
      pricePerHour: dto.pricePerHour,
    };
    this.storage.save('consoles', this.storage.select('consoles').concat(consoleConfig));
    const result = succeed(consoleConfig);

    return result;
  }

  updateConsole(consoleId: string, dto: ConsoleConfigUpdateDto): ServiceResult<ConsoleConfig> {
    const existingConsole = this.findAccessibleConsole(consoleId);
    if (!existingConsole) {
      const notFound = fail(CONSOLE_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const validationError = this.validateValues(dto.quantity, dto.pricePerHour);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const updatedConsole: ConsoleConfig = Object.assign({}, existingConsole, {
      quantity: dto.quantity,
      pricePerHour: dto.pricePerHour,
    });
    const consoles = this.storage
      .select('consoles')
      .map((config) => (config.id === consoleId ? updatedConsole : config));
    this.storage.save('consoles', consoles);
    const result = succeed(updatedConsole);

    return result;
  }

  removeConsole(consoleId: string): ServiceResult<ConsoleConfig> {
    const existingConsole = this.findAccessibleConsole(consoleId);
    if (!existingConsole) {
      const notFound = fail(CONSOLE_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const validationError = this.validateRemoval(existingConsole);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const consoles = this.storage.select('consoles').filter((config) => config.id !== consoleId);
    this.storage.save('consoles', consoles);
    const result = succeed(existingConsole);

    return result;
  }

  private findAccessibleConsole(consoleId: string): ConsoleConfig | undefined {
    const consoleConfig = this.storage
      .select('consoles')
      .find((config) => config.id === consoleId && this.session.canAccessZone(config.zoneId));

    return consoleConfig;
  }

  private validateNewConsole(zoneId: string, dto: ConsoleConfigDto): string | null {
    const zoneExists = this.storage.select('zones').some((zone) => zone.id === zoneId);
    if (!zoneExists) {
      return ZONE_NOT_FOUND_MESSAGE;
    }

    if (this.getConsole(zoneId, dto.consoleType)) {
      return DUPLICATE_CONSOLE_MESSAGE;
    }

    const validationError = this.validateValues(dto.quantity, dto.pricePerHour);

    return validationError;
  }

  private validateValues(quantity: number, pricePerHour: number): string | null {
    if (!Number.isInteger(quantity) || quantity < MIN_CONSOLE_QUANTITY) {
      return QUANTITY_MESSAGE;
    }

    const validationError = pricePerHour > 0 ? null : PRICE_MESSAGE;

    return validationError;
  }

  private validateRemoval(consoleConfig: ConsoleConfig): string | null {
    const hasFutureBookings = this.storage
      .select('bookings')
      .some(
        (booking) =>
          booking.zoneId === consoleConfig.zoneId &&
          booking.consoleType === consoleConfig.consoleType &&
          booking.status === 'Confirmed' &&
          !isInPast(booking.date, booking.startTime),
      );
    const validationError = hasFutureBookings
      ? `${consoleConfig.consoleType} has upcoming confirmed bookings, so it cannot be removed. Cancel those bookings first.`
      : null;

    return validationError;
  }
}
