import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideShieldCheck, LucideStore, LucideUser } from '@lucide/angular';
import { APP_PATHS } from '../../core/config/app-paths';
import { APP_NAME } from '../../core/config/app.constants';
import { SessionService } from '../../core/services/session.service';
import { ZonesService } from '../../core/services/zones.service';
import { AppLogoComponent } from '../../shared/components/app-logo/app-logo.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-role-select',
  imports: [
    ReactiveFormsModule,
    AppLogoComponent,
    FormFieldComponent,
    LucideArrowRight,
    LucideShieldCheck,
    LucideStore,
    LucideUser,
  ],
  templateUrl: './role-select.component.html',
})
export class RoleSelectComponent {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly zonesService = inject(ZonesService);

  protected readonly appName = APP_NAME;
  protected readonly activeZones = computed(() => this.zonesService.getZones({ activeOnly: true }));

  protected readonly ownerForm = new FormGroup({
    zoneId: new FormControl(this.activeZones()[0]?.id ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected async continueAsOwner(): Promise<void> {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();

      return;
    }

    this.session.startOwnerSession(this.ownerForm.controls.zoneId.value);
    await this.router.navigateByUrl(APP_PATHS.owner.dashboard);
  }

  protected async continueAsCustomer(): Promise<void> {
    this.session.startCustomerSession();
    await this.router.navigateByUrl(APP_PATHS.customer.enterEmail);
  }

  protected async continueAsAdmin(): Promise<void> {
    this.session.startAdminSession();
    await this.router.navigateByUrl(APP_PATHS.admin.dashboard);
  }
}
