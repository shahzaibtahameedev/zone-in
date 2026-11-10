import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideGamepad2, LucidePencil, LucidePlus, LucideSave, LucideTrash } from '@lucide/angular';
import { CONSOLE_TYPES, MIN_CONSOLE_QUANTITY } from '../../../core/config/app.constants';
import { ConsoleConfig, ConsoleType } from '../../../core/models';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ConsolesService } from '../../../core/services/consoles.service';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  ruleValidator,
  positiveNumberValidator,
  wholeNumberValidator,
} from '../../../core/validators/form-validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RupeesPipe } from '../../../shared/pipes/format.pipes';

const DUPLICATE_CONSOLE_MESSAGE =
  'You already have this console type. Edit it in the table instead.';

@Component({
  selector: 'app-consoles-pricing',
  imports: [
    ReactiveFormsModule,
    LucidePencil,
    LucidePlus,
    LucideSave,
    LucideTrash,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    RupeesPipe,
  ],
  templateUrl: './consoles-pricing.component.html',
})
export class ConsolesPricingComponent {
  private readonly consolesService = inject(ConsolesService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  private readonly zoneId = this.session.ownerZoneId() ?? '';
  private readonly formCard = viewChild.required<ElementRef<HTMLElement>>('formCard');
  private readonly consoleTypeSelect =
    viewChild.required<ElementRef<HTMLSelectElement>>('consoleTypeSelect');
  private readonly quantityInput =
    viewChild.required<ElementRef<HTMLInputElement>>('quantityInput');

  protected readonly consoleTypeOptions = CONSOLE_TYPES;
  protected readonly emptyIcon = LucideGamepad2;
  protected readonly consoles = computed(() => this.consolesService.getConsoles(this.zoneId));
  protected readonly takenConsoleTypes = computed(() =>
    this.consoles().map((config) => config.consoleType),
  );
  protected readonly editingConsole = signal<ConsoleConfig | null>(null);

  protected readonly form = new FormGroup({
    consoleType: new FormControl<ConsoleType | ''>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        ruleValidator(
          (value) =>
            this.editingConsole() === null &&
            this.takenConsoleTypes().some((type) => type === value),
          DUPLICATE_CONSOLE_MESSAGE,
        ),
      ],
    }),
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(MIN_CONSOLE_QUANTITY), wholeNumberValidator],
    }),
    pricePerHour: new FormControl<number | null>(null, {
      validators: [Validators.required, positiveNumberValidator],
    }),
  });

  protected isConsoleTypeTaken(consoleType: ConsoleType): boolean {
    const isTaken =
      this.editingConsole() === null && this.takenConsoleTypes().includes(consoleType);

    return isTaken;
  }

  protected startAdding(): void {
    this.resetForm();
    this.scrollToForm(this.consoleTypeSelect());
  }

  protected startEditing(consoleConfig: ConsoleConfig): void {
    this.editingConsole.set(consoleConfig);
    this.form.reset({
      consoleType: consoleConfig.consoleType,
      quantity: consoleConfig.quantity,
      pricePerHour: consoleConfig.pricePerHour,
    });
    this.form.controls.consoleType.disable();
    this.scrollToForm(this.quantityInput());
  }

  protected resetForm(): void {
    this.editingConsole.set(null);
    this.form.reset({ consoleType: '', quantity: null, pricePerHour: null });
    this.form.controls.consoleType.enable();
  }

  protected saveConsole(): void {
    const value = this.form.getRawValue();
    if (
      this.form.invalid ||
      value.consoleType === '' ||
      value.quantity === null ||
      value.pricePerHour === null
    ) {
      this.form.markAllAsTouched();

      return;
    }

    const editingConsole = this.editingConsole();
    const result = editingConsole
      ? this.consolesService.updateConsole(editingConsole.id, {
          quantity: value.quantity,
          pricePerHour: value.pricePerHour,
        })
      : this.consolesService.addConsole({
          zoneId: this.zoneId,
          consoleType: value.consoleType,
          quantity: value.quantity,
          pricePerHour: value.pricePerHour,
        });

    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    this.toast.success(
      editingConsole ? `${value.consoleType} updated` : `${value.consoleType} added`,
    );
    this.resetForm();
  }

  protected async removeConsole(consoleConfig: ConsoleConfig): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      message: `Remove ${consoleConfig.consoleType} from your gaming zone? Customers will no longer be able to book it.`,
      confirmLabel: 'Remove',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }

    const result = this.consolesService.removeConsole(consoleConfig.id);
    if (!result.success) {
      this.toast.error(result.error);

      return;
    }

    if (this.editingConsole()?.id === consoleConfig.id) {
      this.resetForm();
    }
    this.toast.success(`${consoleConfig.consoleType} removed`);
  }

  private scrollToForm(fieldToFocus: ElementRef<HTMLElement>): void {
    this.formCard().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fieldToFocus.nativeElement.focus({ preventScroll: true });
  }
}
