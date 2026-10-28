import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The toolbar's buttons, in one place: each one's icon, its name and what it does (the tooltip). Every button draws
 * itself from here, as an icon, its name, or both (the user's choice), so a new button is one line here.
 */
export interface ToolbarButton {
  /** Font Awesome icon class. */
  icon: string;
  /** Translation key of its name. */
  label: string;
  /** Translation key of what it does, when the name isn't enough. */
  help?: string;
  /** The icon after the name ("Next ›"). */
  iconAfter?: boolean;
}

export const TOOLBAR_BUTTONS = {
  mapNext: { icon: 'fa-chevron-right', label: 'WORLD_EDITOR.MAP_NEXT', iconAfter: true },
  worldMap: { icon: 'fa-map', label: 'WORLD_EDITOR.WORLD_MAP', help: 'WORLD_EDITOR.WORLD_MAP_HELP' },
  filters: { icon: 'fa-filter', label: 'WORLD_EDITOR.FILTERS', help: 'WORLD_EDITOR.FILTERS_HELP' },
  view: { icon: 'fa-eye', label: 'WORLD_EDITOR.VIEW', help: 'WORLD_EDITOR.VIEW_HELP' },
  tree: { icon: 'fa-sitemap', label: 'WORLD_EDITOR.TREE', help: 'WORLD_EDITOR.TREE_HELP' },
  resetNorth: { icon: 'fa-location-arrow', label: 'WORLD_EDITOR.RESET_NORTH', help: 'WORLD_EDITOR.RESET_NORTH_HELP' },
  topView: { icon: 'fa-arrows-down-to-line', label: 'WORLD_EDITOR.TOP_VIEW', help: 'WORLD_EDITOR.TOP_VIEW_HELP' },
  controls: { icon: 'fa-keyboard', label: 'WORLD_EDITOR.CONTROLS', help: 'WORLD_EDITOR.CONTROLS_HELP' },
  settings: { icon: 'fa-cog', label: 'WORLD_EDITOR.SETTINGS', help: 'WORLD_EDITOR.SETTINGS_HELP' },
  legend: { icon: 'fa-info-circle', label: 'WORLD_EDITOR.LEGEND', help: 'WORLD_EDITOR.LEGEND_HELP' },
  refresh: { icon: 'fa-sync', label: 'WORLD_EDITOR.REFRESH', help: 'WORLD_EDITOR.REFRESH_HELP' },
} satisfies Record<string, ToolbarButton>;

export type ToolbarButtonId = keyof typeof TOOLBAR_BUTTONS;

/** How the toolbar's buttons show: their icon, their name, or both. */
export type ButtonStyle = 'icons' | 'text' | 'both';
export const BUTTON_STYLES: ButtonStyle[] = ['icons', 'text', 'both'];
export const BUTTON_STYLE_KEY = 'keira3.worldEditor.buttonStyle';

export function loadButtonStyle(): ButtonStyle {
  try {
    const stored = localStorage.getItem(BUTTON_STYLE_KEY) as ButtonStyle;
    return BUTTON_STYLES.includes(stored) ? stored : 'both';
  } catch {
    return 'both';
  }
}

export function saveButtonStyle(style: ButtonStyle): void {
  try {
    localStorage.setItem(BUTTON_STYLE_KEY, style);
  } catch {
    // (not kept)
  }
}

/** The tooltip of a button: what it does, or its name when it shows only its icon and has no help of its own. */
export function buttonTitle(id: ToolbarButtonId): string {
  const button: ToolbarButton = TOOLBAR_BUTTONS[id];
  return button.help ?? button.label;
}

/** A toolbar button's inside: its icon and / or its name, from the list above. */
@Component({
  selector: 'keira-button-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @let b = entry();
    @if (icon() && !b.iconAfter) {
      <i class="fa" [class]="'fa ' + b.icon" [class.fa-spin]="spin()"></i>
    }
    @if (text()) {
      {{ b.label | translate }}
    }
    @if (icon() && b.iconAfter) {
      <i class="fa" [class]="'fa ' + b.icon"></i>
    }
  `,
})
export class ButtonLabelComponent {
  readonly button = input.required<ToolbarButtonId>();
  readonly mode = input<ButtonStyle>('both');
  /** A spinning icon (e.g. while refreshing); shown even when the button shows only its name. */
  readonly spin = input(false);

  protected readonly entry = computed((): ToolbarButton => TOOLBAR_BUTTONS[this.button()]);
  protected readonly icon = computed(() => this.mode() !== 'text' || this.spin());
  protected readonly text = computed(() => this.mode() !== 'icons');
}
