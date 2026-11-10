import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideEye, LucideSearch, LucideUsers } from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { CustomersService } from '../../../core/services/customers.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DisplayDatePipe, OrDashPipe } from '../../../shared/pipes/format.pipes';

@Component({
  selector: 'app-customers-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideEye,
    LucideSearch,
    AvatarComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    DisplayDatePipe,
    OrDashPipe,
  ],
  templateUrl: './customers-list.component.html',
})
export class CustomersListComponent {
  private readonly customersService = inject(CustomersService);

  protected readonly paths = APP_PATHS.admin;
  protected readonly emptyIcon = LucideUsers;
  protected readonly searchForm = new FormGroup({
    term: new FormControl('', { nonNullable: true }),
  });
  protected readonly searchTerm = signal('');
  protected readonly customers = computed(() =>
    this.customersService.getCustomers(this.searchTerm()),
  );

  constructor() {
    this.searchForm.controls.term.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  protected applySearch(): void {
    this.searchTerm.set(this.searchForm.controls.term.value);
  }
}
