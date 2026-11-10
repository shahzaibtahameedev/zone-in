import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';

interface FormValueSource<TValue> {
  valueChanges: Observable<unknown>;
  getRawValue(): TValue;
}

export function formValueSignal<TValue>(form: FormValueSource<TValue>): Signal<TValue> {
  const valueSignal = toSignal(form.valueChanges.pipe(map(() => form.getRawValue())), {
    initialValue: form.getRawValue(),
  });

  return valueSignal;
}

export function toOptionalText(value: string): string | undefined {
  const trimmedValue = value.trim();
  const optionalText = trimmedValue === '' ? undefined : trimmedValue;

  return optionalText;
}
