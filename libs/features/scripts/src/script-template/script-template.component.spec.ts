import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ClipboardService } from 'ngx-clipboard';
import { ScriptTemplateComponent } from './script-template.component';

describe('ScriptTemplateComponent', () => {
  it('makes the files of the kind picked from what is typed, and copies or saves them', () => {
    const clipboard = { copyFromContent: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ScriptTemplateComponent, TranslateTestingModule],
      providers: [{ provide: ClipboardService, useValue: clipboard }],
    });
    const fixture = TestBed.createComponent(ScriptTemplateComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const query = <T extends HTMLElement>(selector: string) => el.querySelector<T>(selector) as T;
    const type = (selector: string, value: string, event = 'input') => {
      const input = query<HTMLInputElement>(selector);
      input.value = value;
      input.dispatchEvent(new Event(event));
      fixture.detectChanges();
    };
    // a creature by default: spells, events, texts; no instance
    expect(query('#template-instance')).toBeNull();
    type('#template-spells', 'Fireball = 133');
    type('#template-events', 'Fireball');
    type('#template-texts', 'Aggro');
    type('#template-entry', '68');
    expect(query('#code-0').textContent).toContain('SPELL_FIREBALL');
    expect(query('#sql').textContent).toContain("'npc_my_script' WHERE `entry` = 68");
    type('#template-entry', '');
    expect(query('#sql').textContent).toContain('`entry` = 0');
    type('#template-name', 'npc_guard');
    query<HTMLButtonElement>('#copy-file-0').click();
    expect(clipboard.copyFromContent).toHaveBeenCalledWith(expect.stringContaining('struct npc_guard'));
    query<HTMLButtonElement>('#copy-sql').click();
    expect(clipboard.copyFromContent).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE'));
    const createObjectURL = vi.fn(() => 'blob:x');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    query<HTMLButtonElement>('#save-file-0').click();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');
    // an instance: its name, its bosses; two files
    type('#template-kind', 'instance', 'change');
    expect(query<HTMLInputElement>('#template-name').value).toBe('instance_my_script');
    expect(query('#template-spells')).toBeNull();
    type('#template-instance', 'Stockade');
    type('#template-bosses', 'Hogger');
    expect(query('#file-0').textContent).toBe('stockade.h');
    expect(query('#code-0').textContent).toContain('DATA_HOGGER');
    // the other kinds
    for (const [kind, prefix] of [
      ['boss', 'boss_'],
      ['gameobject', 'go_'],
      ['spell', 'spell_'],
      ['aura', 'spell_'],
      ['creature', 'npc_'],
    ]) {
      type('#template-kind', kind, 'change');
      expect(query<HTMLInputElement>('#template-name').value).toBe(`${prefix}my_script`);
    }
  });
});
