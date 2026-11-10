export interface GamingZone {
  id: string;
  name: string;
  address: string;
  area: string;
  contactNumber: string;
  contactEmail?: string;
  facilities: string;
  isActive: boolean;
}

export interface GamingZoneDto {
  name: string;
  address: string;
  area: string;
  contactNumber: string;
  contactEmail?: string;
  facilities: string;
  isActive: boolean;
}

export interface GamingZoneFilters {
  activeOnly?: boolean;
}

export interface GamingZoneSummary {
  zone: GamingZone;
  totalBookings: number;
  totalRevenue: number;
}
