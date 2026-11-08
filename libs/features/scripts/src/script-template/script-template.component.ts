import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import {
  parseConstants,
  parseNames,
  SCRIPT_TEMPLATE_KINDS,
  ScriptTemplateKind,
  ScriptTemplateOptions,
  scriptTemplate,
} from './script-template';

/**
 * Starting files for a new AzerothCore script: pick what it is (a creature, a boss, a gameobject, a spell, an aura, an
 * instance), its name and its constants, and copy or save the header, the .cpp, the script loader lines and the SQL
 * naming it in the database.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-script-template',
  templateUrl: './script-template.component.html',
  imports: [TranslatePipe],
})
export class ScriptTemplateComponent {
  private readonly clipboard = inject(ClipboardService);
  protected readonly KINDS = SCRIPT_TEMPLATE_KINDS;
  protected readonly kind = signal<ScriptTemplateKind>('creature');
  protected readonly name = signal('npc_my_script');
  protected readonly entry = signal<number | undefined>(undefined);
  protected readonly instance = signal('');
  protected readonly spells = signal('');
  protected readonly events = signal('');
  protected readonly texts = signal('');
  protected readonly bosses = signal('');

  /** What the files are made from. */
  private readonly options = computed<ScriptTemplateOptions>(() => ({
    kind: this.kind(),
    name: this.name(),
    entry: this.entry(),
    instance: this.instance(),
    spells: parseConstants(this.spells()),
    events: parseNames(this.events()),
    texts: parseNames(this.texts()),
    bosses: parseNames(this.bosses()),
  }));
  protected readonly result = computed(() => scriptTemplate(this.options()));

  /** Which inputs the kind uses. */
  protected uses(field: 'instance' | 'spells' | 'events' | 'texts' | 'bosses'): boolean {
    const kind = this.kind();
    switch (field) {
      case 'instance':
        return kind === 'boss' || kind === 'instance';
      case 'bosses':
        return kind === 'instance';
      case 'spells':
        return kind !== 'gameobject' && kind !== 'instance';
      default:
        return kind === 'creature' || kind === 'boss';
    }
  }

  protected setKind(kind: string): void {
    this.kind.set(kind as ScriptTemplateKind);
    const prefixes: Record<ScriptTemplateKind, string> = {
      creature: 'npc_',
      boss: 'boss_',
      gameobject: 'go_',
      spell: 'spell_',
      aura: 'spell_',
      instance: 'instance_',
    };
    this.name.set(`${prefixes[kind as ScriptTemplateKind]}my_script`);
  }

  protected setEntry(value: string): void {
    this.entry.set(value.trim() === '' ? undefined : Math.trunc(Number(value)));
  }

  protected copy(text: string): void {
    this.clipboard.copyFromContent(text);
  }

  /** Saves a file (the browser's download). */
  protected download(name: string, text: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
