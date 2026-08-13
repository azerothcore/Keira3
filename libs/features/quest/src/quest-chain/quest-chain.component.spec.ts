import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule } from 'ngx-toastr';
import { vi } from 'vitest';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestChainComponent } from './quest-chain.component';
import { buildQuestChainGraph } from './quest-chain.layout';
import { EMPTY_QUEST_CHAIN_GRAPH, QuestChainEntry, QuestChainGraph } from './quest-chain.model';
import { QuestChainService } from './quest-chain.service';

class QuestChainComponentPage extends PageObject<QuestChainComponent> {
  get nodes(): NodeListOf<SVGGElement> {
    return this.queryAll<SVGGElement>('.qc-node');
  }
  get edges(): NodeListOf<SVGPathElement> {
    return this.queryAll<SVGPathElement>('.qc-edge');
  }
  get bands(): NodeListOf<SVGGElement> {
    return this.queryAll<SVGGElement>('.qc-band');
  }
  get reloadButton(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('button');
  }
  get conditionBadges(): NodeListOf<SVGGElement> {
    return this.queryAll<SVGGElement>('.qc-cond');
  }
  get infoAlert(): HTMLElement {
    return this.query<HTMLElement>('.alert-info', false);
  }
  get dangerAlert(): HTMLElement {
    return this.query<HTMLElement>('.alert-danger', false);
  }
  get warningAlert(): HTMLElement {
    return this.query<HTMLElement>('.alert-warning', false);
  }
}

const entry = (id: number, exclusiveGroup = 0, missing = false, title = `Quest ${id}`, conditionCount = 0): QuestChainEntry => ({
  id,
  title,
  missing,
  exclusiveGroup,
  conditionCount,
});

describe('QuestChainComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuestChainComponent, ToastrModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    });
  });

  const setup = async (graph: QuestChainGraph | Error) => {
    const questChainService = TestBed.inject(QuestChainService);
    const handlerService = TestBed.inject(QuestHandlerService);

    handlerService.select(false, 1, 'Some Quest', false);

    const buildSpy = vi
      .spyOn(questChainService, 'buildGraph')
      .mockImplementation(() => (graph instanceof Error ? Promise.reject(graph) : Promise.resolve(graph)));

    const fixture: ComponentFixture<QuestChainComponent> = TestBed.createComponent(QuestChainComponent);
    const page = new QuestChainComponentPage(fixture);

    fixture.detectChanges();
    await page.whenReady();
    fixture.detectChanges();

    return { fixture, page, component: fixture.componentInstance, handlerService, questChainService, buildSpy };
  };

  const twoQuestGraph = () => buildQuestChainGraph([entry(1), entry(2)], [{ from: 1, to: 2, kind: 'chain' }], 1);

  it('should be created', async () => {
    const { component } = await setup(twoQuestGraph());

    expect(component).toBeTruthy();
  });

  it('should draw one box per quest and one path per link', async () => {
    const { page } = await setup(twoQuestGraph());

    expect(page.nodes.length).toBe(2);
    expect(page.edges.length).toBe(1);
  });

  it('should draw a box around an exclusive group', async () => {
    const graph = buildQuestChainGraph(
      [entry(1), entry(2, 40), entry(3, 40)],
      [
        { from: 1, to: 2, kind: 'chain' },
        { from: 1, to: 3, kind: 'chain' },
      ],
      1,
    );
    const { page } = await setup(graph);

    expect(page.bands.length).toBe(1);
  });

  it('should say so when the quest stands alone', async () => {
    const { page } = await setup(buildQuestChainGraph([entry(1)], [], 1));

    expect(page.infoAlert).toBeTruthy();
    expect(page.nodes.length).toBe(0);
  });

  it('should warn when the graph was truncated', async () => {
    const { page } = await setup(buildQuestChainGraph([entry(1), entry(2)], [{ from: 1, to: 2, kind: 'chain' }], 1, true));

    expect(page.warningAlert).toBeTruthy();
  });

  it('should show the message of a failed load', async () => {
    const { page, component } = await setup(new Error('connection lost'));

    expect(page.dangerAlert.innerHTML).toContain('connection lost');
    expect(component['graph']().nodes).toEqual(EMPTY_QUEST_CHAIN_GRAPH.nodes);
  });

  it('should show a non-Error rejection as text', async () => {
    const { fixture, page, component } = await setup(twoQuestGraph());

    vi.spyOn(TestBed.inject(QuestChainService), 'buildGraph').mockRejectedValue('boom');

    await component['load']();
    fixture.detectChanges();

    expect(page.dangerAlert.innerHTML).toContain('boom');
  });

  it('should reload when the button is clicked', async () => {
    const { page, buildSpy } = await setup(twoQuestGraph());

    page.reloadButton.click();

    expect(buildSpy).toHaveBeenCalledTimes(2);
  });

  it('should label a missing quest by id and leave a present one by title', async () => {
    const { component } = await setup(twoQuestGraph());

    expect(component['label']({ id: 7, missing: true } as never)).toBe('[7]');
    expect(component['label']({ id: 7, missing: false, title: 'Wanted: Kill Them' } as never)).toBe('Wanted: Kill Them');
  });

  it('should shorten a long title but leave a short one alone', async () => {
    const { component } = await setup(twoQuestGraph());
    const long = component['shortLabel']({ id: 1, missing: false, title: 'A Very Long Quest Title That Will Not Fit' } as never);

    expect(long).toBe('A Very Long Quest Title…');
    expect(component['shortLabel']({ id: 1, missing: false, title: 'Short' } as never)).toBe('Short');
  });

  it('should open the clicked quest', async () => {
    const { component, handlerService } = await setup(twoQuestGraph());
    // Stubbed: the real select() navigates, and the testing router has no routes configured.
    const selectSpy = vi.spyOn(handlerService, 'select').mockImplementation(() => undefined);

    component['open']({ id: 2, missing: false, isCurrent: false, title: 'Quest 2' } as never);

    expect(selectSpy).toHaveBeenCalledWith(false, 2, 'Quest 2');
  });

  it('should not navigate for the current quest or a missing one', async () => {
    const { component, handlerService } = await setup(twoQuestGraph());
    // Stubbed: the real select() navigates, and the testing router has no routes configured.
    const selectSpy = vi.spyOn(handlerService, 'select').mockImplementation(() => undefined);

    component['open']({ id: 1, missing: false, isCurrent: true, title: 'Quest 1' } as never);
    component['open']({ id: 9, missing: true, isCurrent: false, title: '' } as never);

    expect(selectSpy).not.toHaveBeenCalled();
  });

  it('should badge only the quests that have availability conditions', async () => {
    const graph = buildQuestChainGraph([entry(1, 0, false, 'Quest 1', 2), entry(2)], [{ from: 1, to: 2, kind: 'chain' }], 1);
    const { page } = await setup(graph);

    expect(page.conditionBadges.length).toBe(1);
    expect(page.conditionBadges[0].textContent).toContain('2');
  });

  it('should open the prefilled Conditions search from the badge without also opening the quest', async () => {
    const graph = buildQuestChainGraph([entry(1, 0, false, 'Quest 1', 2), entry(2)], [{ from: 1, to: 2, kind: 'chain' }], 1);
    const { page, handlerService } = await setup(graph);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const selectSpy = vi.spyOn(handlerService, 'select').mockImplementation(() => undefined);

    (page.conditionBadges[0] as unknown as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(navigateSpy).toHaveBeenCalledWith(['conditions/select'], { queryParams: { sourceType: 19, sourceEntry: 1 } });
    // The click must not bubble to the node box, which would navigate to the quest instead.
    expect(selectSpy).not.toHaveBeenCalled();
  });

  it('should navigate when a node box is clicked', async () => {
    const { page, handlerService } = await setup(twoQuestGraph());
    // Stubbed: the real select() navigates, and the testing router has no routes configured.
    const selectSpy = vi.spyOn(handlerService, 'select').mockImplementation(() => undefined);

    (page.nodes[1] as unknown as HTMLElement).dispatchEvent(new MouseEvent('click'));

    expect(selectSpy).toHaveBeenCalled();
  });
});
