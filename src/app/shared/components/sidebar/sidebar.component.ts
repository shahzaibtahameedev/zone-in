import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideArrowLeftRight,
  LucideDynamicIcon,
  LucideIconInput,
  LucideMenu,
  LucideX,
} from '@lucide/angular';
import { APP_PATHS } from '../../../core/config/app-paths';
import { SessionService } from '../../../core/services/session.service';
import { AppLogoComponent } from '../app-logo/app-logo.component';
import { AvatarComponent } from '../avatar/avatar.component';

export interface NavLink {
  label: string;
  path: string;
  icon: LucideIconInput;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    LucideMenu,
    LucideX,
    LucideArrowLeftRight,
    AppLogoComponent,
    AvatarComponent,
  ],
  host: { class: 'contents' },
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly session = inject(SessionService);

  readonly links = input.required<NavLink[]>();
  readonly profileName = input.required<string>();
  readonly profileRole = input.required<string>();

  protected readonly isMenuOpen = signal(false);
  protected readonly roleSelectPath = APP_PATHS.roleSelect;

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected switchRole(): void {
    this.session.clearSession();
  }
}
