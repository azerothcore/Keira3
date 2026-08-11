import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { QuestChainRelationRow, QuestConditionPrerequisiteRow, QuestTitleRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ToastrModule } from 'ngx-toastr';
import { vi } from 'vitest';
import { QuestHandlerService } from '../quest-handler.service';
import { MAX_QUEST_CHAIN_NODES, MAX_QUEST_CHAIN_ROUNDS, QuestChainService } from './quest-chain.service';

const row = (values: Partial<QuestChainRelationRow> & { ID: number }): QuestChainRelationRow => ({
  PrevQuestID: 0,
  NextQuestID: 0,
  ExclusiveGroup: 0,
  BreadcrumbForQuestId: 0,
  ...values,
});

const prerequisite = (gatedQuest: number, requiredQuest: number, elseGroup = 0): QuestConditionPrerequisiteRow => ({
  SourceEntry: gatedQuest,
  ElseGroup: elseGroup,
  ConditionValue1: requiredQuest,
});

describe('QuestChainService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    });
  });

  const setup = (
    selected: string | number,
    relations: QuestChainRelationRow[] | QuestChainRelationRow[][],
    titles?: QuestTitleRow[],
    prerequisites: QuestConditionPrerequisiteRow[] = [],
  ) => {
    const service = TestBed.inject(QuestChainService);
    const handlerService = TestBed.inject(QuestHandlerService);
    const mysqlQueryService = TestBed.inject(MysqlQueryService);

    handlerService.select(false, selected, 'Some Quest', false);

    // An array of arrays feeds one batch per expansion round.
    const batches = Array.isArray(relations[0]) ? (relations as QuestChainRelationRow[][]) : [relations as QuestChainRelationRow[]];
    let round = 0;

    const relationsSpy = vi
      .spyOn(mysqlQueryService, 'getQuestChainRelations')
      .mockImplementation(() => Promise.resolve(batches[Math.min(round++, batches.length - 1)] ?? []));

    const flat = batches.flat();
    const titlesSpy = vi
      .spyOn(mysqlQueryService, 'getQuestTitlesByIds')
      .mockImplementation(() => Promise.resolve(titles ?? flat.map((relation) => ({ ID: relation.ID, LogTitle: `Quest ${relation.ID}` }))));

    const conditionsSpy = vi.spyOn(mysqlQueryService, 'getQuestConditionCounts').mockResolvedValue([]);
    const prerequisitesSpy = vi.spyOn(mysqlQueryService, 'getQuestConditionPrerequisites').mockResolvedValue(prerequisites);

    return { service, handlerService, mysqlQueryService, relationsSpy, titlesSpy, conditionsSpy, prerequisitesSpy };
  };

  it('should be created', () => {
    expect(TestBed.inject(QuestChainService)).toBeTruthy();
  });

  it('should expose the selected quest id', () => {
    const { service } = setup(42, []);

    expect(service.selectedId).toBe(42);
  });

  it('should return an empty graph when no quest is selected', async () => {
    const { service, relationsSpy } = setup('', []);

    expect((await service.buildGraph()).nodes).toEqual([]);
    expect(relationsSpy).not.toHaveBeenCalled();
  });

  it('should return an empty graph when the selection is not a number', async () => {
    const { service, relationsSpy } = setup('not-a-quest', []);

    expect((await service.buildGraph()).nodes).toEqual([]);
    expect(relationsSpy).not.toHaveBeenCalled();
  });

  it('should build a two-quest chain from PrevQuestID', async () => {
    const { service } = setup(2, [row({ ID: 2, PrevQuestID: 1 })]);
    const graph = await service.buildGraph();

    expect(graph.nodes.map((node) => node.id).sort()).toEqual([1, 2]);
    expect(graph.edges).toEqual([expect.objectContaining({ from: 1, to: 2, kind: 'chain' })]);
  });

  it('should treat a negative PrevQuestID as an "enabled by" link', async () => {
    const { service } = setup(2, [row({ ID: 2, PrevQuestID: -1 })]);

    expect((await service.buildGraph()).edges).toEqual([expect.objectContaining({ from: 1, to: 2, kind: 'enabled-by' })]);
  });

  it('should follow NextQuestID forward', async () => {
    const { service } = setup(1, [row({ ID: 1, NextQuestID: 2 })]);

    expect((await service.buildGraph()).edges).toEqual([expect.objectContaining({ from: 1, to: 2, kind: 'chain' })]);
  });

  it('should follow BreadcrumbForQuestId', async () => {
    const { service } = setup(2, [row({ ID: 1, BreadcrumbForQuestId: 2 }), row({ ID: 2 })]);

    expect((await service.buildGraph()).edges).toEqual([expect.objectContaining({ from: 1, to: 2, kind: 'breadcrumb' })]);
  });

  it('should draw a link stated from both sides only once', async () => {
    // 1 says "next is 2" and 2 says "prev is 1": the same edge, declared twice.
    const { service } = setup(1, [row({ ID: 1, NextQuestID: 2 }), row({ ID: 2, PrevQuestID: 1 })]);

    expect((await service.buildGraph()).edges.length).toBe(1);
  });

  it('should ignore unset relation columns', async () => {
    const { service } = setup(1, [row({ ID: 1 })]);
    const graph = await service.buildGraph();

    expect(graph.nodes.map((node) => node.id)).toEqual([1]);
    expect(graph.edges).toEqual([]);
  });

  it('should carry the exclusive group onto the node', async () => {
    const { service } = setup(1, [row({ ID: 1, ExclusiveGroup: 77 }), row({ ID: 2, ExclusiveGroup: 77, PrevQuestID: 1 })]);
    const graph = await service.buildGraph();

    expect(graph.nodes.find((node) => node.id === 1)?.exclusiveGroup).toBe(77);
    expect(graph.bands.map((band) => band.group)).toEqual([77]);
  });

  it('should expand exclusive groups so sibling alternatives are found', async () => {
    const { service, relationsSpy } = setup(1, [
      [row({ ID: 1, ExclusiveGroup: 77 })],
      [row({ ID: 1, ExclusiveGroup: 77 }), row({ ID: 5, ExclusiveGroup: 77 })],
    ]);
    const graph = await service.buildGraph();

    expect(relationsSpy).toHaveBeenNthCalledWith(1, [1], []);
    expect(relationsSpy).toHaveBeenNthCalledWith(2, [], [77]);
    expect(graph.nodes.map((node) => node.id).sort()).toEqual([1, 5]);
  });

  it('should request each exclusive group only once', async () => {
    const { service, relationsSpy } = setup(1, [
      [row({ ID: 1, ExclusiveGroup: 77 }), row({ ID: 2, ExclusiveGroup: 77, PrevQuestID: 1 })],
      [],
    ]);

    await service.buildGraph();

    // Two quests share group 77, but it must be queried once, not once per member.
    expect(relationsSpy).toHaveBeenNthCalledWith(2, [2], [77]);
  });

  it('should flag a referenced quest that has no quest_template row as missing', async () => {
    const { service } = setup(1, [row({ ID: 1, NextQuestID: 2 })], [{ ID: 1, LogTitle: 'Quest 1' }]);
    const graph = await service.buildGraph();

    expect(graph.nodes.find((node) => node.id === 2)?.missing).toBe(true);
    expect(graph.nodes.find((node) => node.id === 1)?.missing).toBe(false);
  });

  it('should tolerate a null title', async () => {
    const { service } = setup(1, [row({ ID: 1 })], [{ ID: 1, LogTitle: null } as unknown as QuestTitleRow]);
    const graph = await service.buildGraph();

    expect(graph.nodes[0].title).toBe('');
    expect(graph.nodes[0].missing).toBe(false);
  });

  it('should attach the availability condition count to the matching quest', async () => {
    const { service, conditionsSpy } = setup(1, [row({ ID: 1, NextQuestID: 2 })]);
    conditionsSpy.mockResolvedValue([{ SourceEntry: 1, conditionCount: 3 }]);
    const graph = await service.buildGraph();

    expect(graph.nodes.find((node) => node.id === 1)?.conditionCount).toBe(3);
    expect(graph.nodes.find((node) => node.id === 2)?.conditionCount).toBe(0);
  });

  it('should default the exclusive group of a quest that has no addon row', async () => {
    const { service } = setup(1, [row({ ID: 1, NextQuestID: 2 })]);
    const graph = await service.buildGraph();

    expect(graph.nodes.find((node) => node.id === 2)?.exclusiveGroup).toBe(0);
  });

  it('should pull in quests that are linked only by conditions', async () => {
    // 13161 needs 13146, 13147 and 13160 rewarded, and says so only in `conditions`: none of the four names
    // another in quest_template_addon, so without reading conditions 13161 looks like it stands alone.
    const { service } = setup(13161, [], undefined, [prerequisite(13161, 13146), prerequisite(13161, 13147), prerequisite(13161, 13160)]);
    const graph = await service.buildGraph();

    expect(graph.nodes.map((node) => node.id).sort((a, b) => a - b)).toEqual([13146, 13147, 13160, 13161]);
    // All three sit in the same else group, so each one is genuinely required.
    expect(graph.edges.map((edge) => [edge.from, edge.to, edge.kind])).toEqual([
      [13146, 13161, 'condition'],
      [13147, 13161, 'condition'],
      [13160, 13161, 'condition'],
    ]);
  });

  it('should mark prerequisites as alternatives when they sit in different else groups', async () => {
    // 13122 is offered after 13104 or 13105, so neither of them is required on its own. Again the link exists
    // nowhere else: 13122 has no PrevQuestID, and neither 13104 nor 13105 points at it.
    const { service } = setup(13122, [], undefined, [prerequisite(13122, 13104, 0), prerequisite(13122, 13105, 1)]);

    expect((await service.buildGraph()).edges.map((edge) => edge.kind)).toEqual(['condition-any', 'condition-any']);
  });

  it('should draw one edge for a prerequisite repeated across else groups', async () => {
    const { service } = setup(13161, [], undefined, [prerequisite(13161, 13146, 0), prerequisite(13161, 13146, 1)]);

    expect((await service.buildGraph()).edges.length).toBe(1);
  });

  it('should ignore a prerequisite that names no quest, or names its own quest', async () => {
    const { service } = setup(13161, [], undefined, [prerequisite(13161, 0), prerequisite(13161, 13161)]);
    const graph = await service.buildGraph();

    expect(graph.edges).toEqual([]);
    expect(graph.nodes.map((node) => node.id)).toEqual([13161]);
  });

  it('should keep walking outwards from a quest discovered through a condition', async () => {
    const { service, mysqlQueryService, relationsSpy } = setup(13161, [[], []]);
    let round = 0;

    vi.spyOn(mysqlQueryService, 'getQuestConditionPrerequisites').mockImplementation(() =>
      Promise.resolve(round++ === 0 ? [prerequisite(13161, 13146)] : []),
    );

    await service.buildGraph();

    // 13146 was reachable only through the condition; the walk still has to expand from it.
    expect(relationsSpy).toHaveBeenNthCalledWith(2, [13146], []);
  });

  it('should ask for the prerequisites of the current frontier', async () => {
    const { service, prerequisitesSpy } = setup(13161, [row({ ID: 13161 })]);

    await service.buildGraph();

    expect(prerequisitesSpy).toHaveBeenNthCalledWith(1, [13161]);
  });

  it('should stop and flag truncation once the node budget is exceeded', async () => {
    const wide = Array.from({ length: MAX_QUEST_CHAIN_NODES + 5 }, (_, index) => row({ ID: index + 1, PrevQuestID: 1 }));
    const { service, relationsSpy } = setup(1, wide);
    const graph = await service.buildGraph();

    expect(graph.truncated).toBe(true);
    expect(relationsSpy).toHaveBeenCalledTimes(1);
    // One round can take the walk past the budget, so the budget has to be applied to what is drawn:
    // laying out every one of these would be quadratic on exactly the data the cap exists for.
    expect(graph.nodes.length).toBe(MAX_QUEST_CHAIN_NODES);
  });

  it('should stop expanding after the round limit on data that keeps growing', async () => {
    const { service, mysqlQueryService } = setup(1, []);
    let next = 1;

    vi.spyOn(mysqlQueryService, 'getQuestChainRelations').mockImplementation(() => {
      const current = next++;
      return Promise.resolve([row({ ID: current, NextQuestID: current + 1 })]);
    });

    const graph = await service.buildGraph();

    expect(mysqlQueryService.getQuestChainRelations).toHaveBeenCalledTimes(MAX_QUEST_CHAIN_ROUNDS);
    // Stopping on the round limit leaves quests unwalked just as the node budget does, and the view
    // has to say so - otherwise a cut-off chain reads as one that genuinely ends there.
    expect(graph.truncated).toBe(true);
  });

  it('should flag truncation when the round limit is hit while only groups are left to expand', async () => {
    const { service, mysqlQueryService } = setup(1, []);
    let group = 1;

    // The quest never changes, but it keeps naming a new exclusive group, so the id frontier stays
    // empty while the group frontier never drains.
    vi.spyOn(mysqlQueryService, 'getQuestChainRelations').mockImplementation(() =>
      Promise.resolve([row({ ID: 1, ExclusiveGroup: group++ })]),
    );

    const graph = await service.buildGraph();

    expect(mysqlQueryService.getQuestChainRelations).toHaveBeenCalledTimes(MAX_QUEST_CHAIN_ROUNDS);
    expect(graph.truncated).toBe(true);
  });

  it('should stop as soon as the frontier is empty', async () => {
    const { service, relationsSpy } = setup(1, [[row({ ID: 1 })], []]);
    const graph = await service.buildGraph();

    expect(relationsSpy).toHaveBeenCalledTimes(1);
    // A walk that drained its frontier saw the whole chain: nothing to warn about.
    expect(graph.truncated).toBe(false);
  });

  it('should clear the query cache so a reload actually re-reads the database', async () => {
    const { service, mysqlQueryService } = setup(1, [row({ ID: 1 })]);
    const clearCacheSpy = vi.spyOn(mysqlQueryService, 'clearCache');

    await service.buildGraph();

    // Every query below is cached, so without this the Reload button would only redraw stale data.
    expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  });
});
