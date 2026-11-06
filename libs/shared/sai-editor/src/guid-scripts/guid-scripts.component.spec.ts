import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { of, throwError } from 'rxjs';
import { SaiHandlerService } from '../sai-handler.service';
import { GuidScriptsComponent } from './guid-scripts.component';

@Component({
  template: `<keira-guid-scripts [sourceType]="sourceType()" [entry]="entry()" />`,
  imports: [GuidScriptsComponent],
})
class HostComponent {
  readonly sourceType = signal(0);
  readonly entry = signal(299);
}

describe('GuidScriptsComponent', () => {
  const setup = (answer: unknown) => {
    TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    const query = vi
      .spyOn(TestBed.inject(MysqlQueryService), 'query')
      .mockImplementation(() => (answer instanceof Error ? throwError(() => answer) : of(answer)) as never);
    const select = vi.spyOn(TestBed.inject(SaiHandlerService), 'select').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, query, select, el: fixture.nativeElement as HTMLElement };
  };

  it("lists the entry's spawns with a script of their own, and opens one", () => {
    const { fixture, query, select, el } = setup([{ entryorguid: -42, map: 0, rowCount: 3 }]);
    expect(query.mock.calls[0][0]).toContain('JOIN creature t ON t.guid = -s.entryorguid');
    expect(query.mock.calls[0][0]).toContain('s.source_type = 0 AND s.entryorguid < 0 AND t.id = 299');
    // (`rows` is a reserved word in MySQL 8; the order only uses grouped columns)
    expect(query.mock.calls[0][0]).toContain('COUNT(*) AS `rowCount`');
    expect(query.mock.calls[0][0]).toContain('ORDER BY s.entryorguid DESC');
    expect(el.querySelector('#guid-scripts')?.textContent).toContain('42');
    (el.querySelector('#open-guid-script-42') as HTMLButtonElement).click();
    expect(select).toHaveBeenCalledWith(false, { entryorguid: -42, source_type: 0 }, 'GUID 42');
    // a gameobject: its table
    fixture.componentInstance.sourceType.set(1);
    fixture.detectChanges();
    expect(query.mock.calls[1][0]).toContain('JOIN gameobject t');
  });

  it('says when there are none, or they can not be read', () => {
    expect(setup(null).el.querySelector('#no-guid-scripts')).toBeTruthy();
    TestBed.resetTestingModule();
    expect(setup(new Error('down')).el.querySelector('#no-guid-scripts')).toBeTruthy();
  });
});
