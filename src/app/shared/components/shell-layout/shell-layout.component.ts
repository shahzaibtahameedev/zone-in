import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavLink, SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen lg:flex">
      <app-sidebar [links]="links()" [profileName]="profileName()" [profileRole]="profileRole()" />
      <main class="min-w-0 flex-1 px-3 pb-6 lg:py-6 lg:pr-6 lg:pl-3">
        <div class="mx-auto max-w-7xl">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class ShellLayoutComponent {
  readonly links = input.required<NavLink[]>();
  readonly profileName = input.required<string>();
  readonly profileRole = input.required<string>();
}
