export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

export interface ServiceFailure {
  success: false;
  error: string;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export function succeed<T>(data: T): ServiceSuccess<T> {
  const result: ServiceSuccess<T> = { success: true, data };

  return result;
}

export function fail(error: string): ServiceFailure {
  const result: ServiceFailure = { success: false, error };

  return result;
}
