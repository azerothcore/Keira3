import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EDEN_MENUS, EdenAction, edenItemEnabled, EdenMenuItem } from './eden-menu';

/** The World Editor's menu bar (Eden Editor's): World, Edit, View, Settings, Help, each item with its key. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-eden-menu-bar',
  imports: [TranslatePipe],
  template: `
    <nav class="eden-menu-bar d-flex" data-testid="eden-menu-bar">
      @for (menu of MENUS; track menu.label; let i = $index) {
        <div class="eden-menu position-relative">
          <button
            type="button"
            class="btn btn-sm btn-link eden-menu-title"
            [attr.data-testid]="'eden-menu-' + i"
            [class.open]="open() === i"
            (click)="toggle(i, $event)"
            (mouseenter)="open() !== undefined && open.set(i)"
          >
            {{ menu.label | translate }}
          </button>
          @if (open() === i) {
            <div class="eden-menu-items shadow-sm">
              @for (item of menu.items; track $index) {
                @if (item === 'separator') {
                  <div class="dropdown-divider my-1"></div>
                } @else {
                  <button
                    type="button"
                    class="dropdown-item d-flex justify-content-between gap-3"
                    [attr.data-testid]="'eden-item-' + item.action"
                    [disabled]="!enabled(item)"
                    (click)="run(item)"
                  >
                    <span>{{ item.label | translate }}</span>
                    @if (item.shortcut) {
                      <span class="text-muted small">{{ item.shortcut }}</span>
                    }
                  </button>
                }
              }
            </div>
          }
        </div>
      }
    </nav>
  `,
  styles: `
    .eden-menu-bar {
      border-bottom: 1px solid var(--bs-border-color, #444);
      margin-bottom: 4px;
    }
    .eden-menu-title {
      text-decoration: none;
      color: var(--bs-body-color);
      padding: 2px 10px;
    }
    .eden-menu-title.open,
    .eden-menu-title:hover {
      background: var(--bs-secondary-bg, #333);
    }
    .eden-menu-items {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1050;
      min-width: 240px;
      padding: 4px 0;
      background: var(--bs-body-bg, #222);
      border: 1px solid var(--bs-border-color, #444);
    }
    .dropdown-item {
      font-size: 13px;
    }
  `,
})
export class EdenMenuBarComponent {
  readonly pending = input(0);
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly action = output<EdenAction>();

  protected readonly MENUS = EDEN_MENUS;
  protected readonly open = signal<number | undefined>(undefined);

  protected toggle(index: number, event: Event): void {
    event.stopPropagation();
    this.open.set(this.open() === index ? undefined : index);
  }

  protected enabled(item: EdenMenuItem): boolean {
    return edenItemEnabled(item.action, { pending: this.pending(), canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  protected run(item: EdenMenuItem): void {
    this.open.set(undefined);
    this.action.emit(item.action);
  }

  /** A click anywhere else closes the open menu. */
  @HostListener('document:click')
  protected close(): void {
    this.open.set(undefined);
  }
}
