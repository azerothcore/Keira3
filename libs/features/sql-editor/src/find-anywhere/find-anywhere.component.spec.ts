import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { FIND_REFERENCES } from './find-anywhere';
import { FIND_LIMIT, FindAnywhereComponent } from './find-anywhere.component';

class FindAnywherePage extends PageObject<FindAnywhereComponent> {
  kind(kind: string): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByTestId(`kind-${kind}`);
  }
  idInput(): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss('#find-anywhere-id');
  }
  findButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#find-anywhere-btn');
  }
  result(table: string, assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByTestId(`result-${table}`, assert);
  }
  error(table: string): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByTestId(`error-${table}`);
  }
  none(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByCss('#find-anywhere-none', assert);
  }
  resultCount(): number {
    return this.queryAll('.find-anywhere-result').length;
  }

  async typeId(value: string): Promise<void> {
    this.idInput().nativeElement.value = value;
    this.idInput().nativeElement.dispatchEvent(new Event('input'));
    await this.settle();
  }
  async click(element: DebugHtmlElement<HTMLElement>): Promise<void> {
    element.nativeElement.click();
    await this.settle();
  }
  async settle(): Promise<void> {
    await this.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    this.fixture.detectChanges();
  }
}

describe(FindAnywhereComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FindAnywhereComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = async () => {
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query');
    const page = new FindAnywherePage(TestBed.createComponent(FindAnywhereComponent));
    page.fixture.detectChanges();
    await page.settle();
    return { page, query };
  };

  it('searches every table using a creature, showing the ones having rows and the failed ones', async () => {
    const { page, query } = await setup();
    query.mockImplementation(((sql: string) => {
      if (sql.includes('FROM `creature` ')) {
        return of([{ guid: 1, id1: 3 }]);
      }
      if (sql.includes('FROM `vehicle_template_accessory`')) {
        return throwError(() => ({ message: "Table doesn't exist" }));
      }
      if (sql.includes('FROM `npc_vendor`')) {
        return throwError(() => 'down');
      }
      if (sql.includes('FROM `creature_text`')) {
        return of(Array.from({ length: FIND_LIMIT }, (_, i) => ({ CreatureID: 3, ID: i })));
      }
      return sql.includes('FROM `creature_queststarter`') ? of(undefined) : of([]);
    }) as never);
    expect(page.findButton().nativeElement.disabled).toBe(true);

    await page.typeId('3');
    await page.click(page.findButton());

    expect(query).toHaveBeenCalledTimes(FIND_REFERENCES.creature.length);
    expect(query).toHaveBeenCalledWith('SELECT * FROM `creature` WHERE `id1` = 3 OR `id2` = 3 OR `id3` = 3 LIMIT 50');
    expect(page.resultCount()).toBe(4);
    expect(page.result('creature').nativeElement.textContent).toContain('1');
    expect(page.result('creature_text').nativeElement.textContent).toContain(`${FIND_LIMIT}+`);
    expect(page.error('vehicle_template_accessory').nativeElement.textContent).toContain("Table doesn't exist");
    expect(page.error('npc_vendor').nativeElement.textContent).toContain('down');
    expect(page.result('creature_queststarter', false)).toBeFalsy();
  });

  it('searches the kind chosen, and says when nothing uses the id', async () => {
    const { page, query } = await setup();
    query.mockReturnValue(of([]));

    await page.click(page.kind('spell'));
    await page.typeId('133');
    await page.click(page.findButton());

    expect(query).toHaveBeenCalledTimes(FIND_REFERENCES.spell.length);
    expect(page.kind('spell').nativeElement.classList).toContain('btn-primary');
    expect(page.none()).toBeTruthy();
  });

  it('does not search without an id', async () => {
    const { page, query } = await setup();

    await page.typeId('');
    page.idInput().nativeElement.form?.dispatchEvent(new Event('submit'));
    await page.settle();

    expect(query).not.toHaveBeenCalled();
    expect(page.none(false)).toBeFalsy();
  });
});
