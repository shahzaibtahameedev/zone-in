export type UserRole = 'owner' | 'customer' | 'admin';

export interface Session {
  role: UserRole | null;
  zoneId: string | null;
  customerEmail: string | null;
}
