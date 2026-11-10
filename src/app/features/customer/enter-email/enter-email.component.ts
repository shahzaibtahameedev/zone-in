import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideMail } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { CustomersService } from '../../../core/services/customers.service';
import { SessionService } from '../../../core/services/session.service';
import { emailFormatValidator } from '../../../core/validators/form-validators';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-enter-email',
  imports: [ReactiveFormsModule, LucideArrowRight, LucideMail, FormFieldComponent],
  template: `
    <div class="mx-auto mt-6 max-w-[28rem] sm:mt-12">
      <section class="card p-6 sm:p-8" aria-labelledby="enter-email-title">
        <span
          class="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"
        >
          <svg lucideMail class="size-5"></svg>
        </span>
        <h1
          id="enter-email-title"
          class="mt-4 text-2xl font-semibold tracking-tight text-slate-900"
        >
          Book a gaming session
        </h1>
        <p class="mt-1 text-sm text-slate-500">Enter your email to continue. No sign-up needed.</p>

        <form
          class="mt-6 flex flex-col gap-5"
          [formGroup]="form"
          (ngSubmit)="continueToBrowse()"
          novalidate
        >
          <app-form-field
            label="Email Address"
            fieldId="customer-email"
            [control]="form.controls.email"
            [required]="true"
          >
            <input
              id="customer-email"
              type="email"
              class="input"
              formControlName="email"
              autocomplete="email"
              placeholder="you@example.com"
            />
          </app-form-field>
          <button type="submit" class="btn-primary w-full">
            Continue
            <svg lucideArrowRight class="size-4"></svg>
          </button>
        </form>
      </section>
    </div>
  `,
})
export class EnterEmailComponent {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly customersService = inject(CustomersService);

  protected readonly form = new FormGroup({
    email: new FormControl(this.session.customerEmail() ?? '', {
      nonNullable: true,
      validators: [Validators.required, emailFormatValidator],
    }),
  });

  protected async continueToBrowse(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const customer = this.customersService.findOrCreateCustomer(this.form.controls.email.value);
    this.session.setCustomerEmail(customer.email);
    await this.router.navigateByUrl(APP_PATHS.customer.browse);
  }
}
