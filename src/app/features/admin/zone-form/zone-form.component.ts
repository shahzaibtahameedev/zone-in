import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideSave, LucideStore } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import {
  ZONE_AREAS,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
} from '../../../core/config/app.constants';
import { GamingZoneDto } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { ZonesService } from '../../../core/services/zones.service';
import { toOptionalText } from '../../../core/utils/form.utils';
import {
  emailFormatValidator,
  pakistaniPhoneValidator,
  ruleValidator,
} from '../../../core/validators/form-validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const NAME_TAKEN_MESSAGE = 'A gaming zone with this name already exists.';

@Component({
  selector: 'app-zone-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCircleAlert,
    LucideSave,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
  ],
  templateUrl: './zone-form.component.html',
})
export class ZoneFormComponent implements OnInit {
  private readonly zonesService = inject(ZonesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly zonesPath = APP_PATHS.admin.zones;
  protected readonly areas = ZONE_AREAS;
  protected readonly notFoundIcon = LucideStore;
  protected readonly isEditing = computed(() => this.id() !== undefined);
  protected readonly pageTitle = computed(() =>
    this.isEditing() ? 'Edit Gaming Zone' : 'Add Gaming Zone',
  );
  protected readonly isNotFound = signal(false);
  protected readonly formError = signal('');

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(ZONE_NAME_MIN_LENGTH),
        Validators.maxLength(ZONE_NAME_MAX_LENGTH),
        ruleValidator(
          (value) => this.zonesService.isZoneNameTaken(value, this.id()),
          NAME_TAKEN_MESSAGE,
        ),
      ],
    }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    area: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contactNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, pakistaniPhoneValidator],
    }),
    contactEmail: new FormControl('', { nonNullable: true, validators: [emailFormatValidator] }),
    facilities: new FormControl('', { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    const zoneId = this.id();
    if (zoneId === undefined) {
      return;
    }

    const zone = this.zonesService.getZoneById(zoneId);
    if (!zone) {
      this.isNotFound.set(true);

      return;
    }

    this.form.reset({
      name: zone.name,
      address: zone.address,
      area: zone.area,
      contactNumber: zone.contactNumber,
      contactEmail: zone.contactEmail ?? '',
      facilities: zone.facilities,
      isActive: zone.isActive,
    });
  }

  protected async saveZone(): Promise<void> {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const dto: GamingZoneDto = {
      name: value.name,
      address: value.address,
      area: value.area,
      contactNumber: value.contactNumber,
      contactEmail: toOptionalText(value.contactEmail),
      facilities: value.facilities,
      isActive: value.isActive,
    };
    const zoneId = this.id();
    const result =
      zoneId === undefined
        ? this.zonesService.createZone(dto)
        : this.zonesService.updateZone(zoneId, dto);

    if (!result.success) {
      this.formError.set(result.error);

      return;
    }

    this.toast.success(
      zoneId === undefined ? `${result.data.name} added` : `${result.data.name} updated`,
    );
    await this.router.navigateByUrl(this.zonesPath);
  }
}
