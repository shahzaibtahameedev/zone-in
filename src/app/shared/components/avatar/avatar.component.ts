import { Component, computed, input } from '@angular/core';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-800',
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800',
  'bg-emerald-100 text-emerald-800',
];
const MAX_INITIALS = 2;

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
      [class]="colorClasses()"
      aria-hidden="true"
    >
      {{ initials() }}
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();

  protected readonly initials = computed(() => {
    const words = this.name()
      .trim()
      .split(/\s+/)
      .filter((word) => word !== '');
    const initials = words
      .slice(0, MAX_INITIALS)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');

    return initials;
  });

  protected readonly colorClasses = computed(() => {
    const nameHash = Array.from(this.name()).reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    );
    const colorClasses = AVATAR_COLORS[nameHash % AVATAR_COLORS.length];

    return colorClasses;
  });
}
