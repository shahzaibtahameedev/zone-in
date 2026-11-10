export type ConsoleType = 'PS5' | 'PS4' | 'Xbox' | 'PC Room';

export interface ConsoleConfig {
  id: string;
  zoneId: string;
  consoleType: ConsoleType;
  quantity: number;
  pricePerHour: number;
}

export interface ConsoleConfigDto {
  zoneId: string;
  consoleType: ConsoleType;
  quantity: number;
  pricePerHour: number;
}

export interface ConsoleConfigUpdateDto {
  quantity: number;
  pricePerHour: number;
}
