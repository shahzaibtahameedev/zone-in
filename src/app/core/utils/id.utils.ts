export function createId(prefix: string): string {
  const id = `${prefix}-${crypto.randomUUID()}`;

  return id;
}

export function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  return normalizedEmail;
}
