import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { getValidationMessage } from '../../../core/validators/validation-messages';

@Component({
  selector: 'app-form-field',
  template: `
    <div class="flex flex-col gap-1.5">
      <label class="label" [attr.for]="fieldId()">
        {{ label() }}
        @if (required()) {
          <span class="text-rose-600" aria-hidden="true">*</span>
        }
      </label>
      <ng-content />
      @if (hint()) {
        <p class="hint">{{ hint() }}</p>
      }
      @if (errorMessage(); as message) {
        <p class="field-error" role="alert">{{ message }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly hint = input('');
  readonly required = input(false);

  protected errorMessage(): string {
    const control = this.control();
    const shouldShowError =
      control !== null && control.invalid && control.touched && control.errors !== null;
    const message =
      shouldShowError && control.errors ? getValidationMessage(control.errors, this.label()) : '';

    return message;
  }
}
