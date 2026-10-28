import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { vi } from 'vitest';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import { worldEditorLinks } from './world-editor-links';

describe('worldEditorLinks', () => {
  it('opens the creature, its SAI and gameobjects through their handlers', () => {
    const creature = { select: vi.fn() };
    const gameobject = { select: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    const sai = { selectFromEntity: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: CreatureHandlerService, useValue: creature },
        { provide: GameobjectHandlerService, useValue: gameobject },
        { provide: Router, useValue: router },
        { provide: SaiHandlerService, useValue: sai },
      ],
    });
    const links = TestBed.runInInjectionContext(() => worldEditorLinks());

    links.openCreature(197, 'Marshal McBride');
    expect(creature.select).toHaveBeenCalledWith(false, 197, 'Marshal McBride');
    expect(router.navigate).not.toHaveBeenCalled();

    links.openCreatureSai(197, 'Marshal McBride');
    expect(creature.select).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledWith(['creature/sai-creature']);

    links.openGameObject(1561, 'Mailbox');
    expect(gameobject.select).toHaveBeenCalledWith(false, 1561, 'Mailbox');

    links.openGameObjectSai(1561, 'Mailbox');
    expect(router.navigate).toHaveBeenLastCalledWith(['gameobject/sai-gameobject']);
    links.openAreaTriggerSai(45);
    expect(sai.selectFromEntity).toHaveBeenCalledWith(2, 45);
  });

  it('opens the loot editors of creatures and gameobjects', () => {
    const creature = { select: vi.fn() };
    const gameobject = { select: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: CreatureHandlerService, useValue: creature },
        { provide: GameobjectHandlerService, useValue: gameobject },
        { provide: Router, useValue: router },
        { provide: SaiHandlerService, useValue: {} },
      ],
    });
    const links = TestBed.runInInjectionContext(() => worldEditorLinks());
    links.openLoot('skinning', 197, 'Wolf');
    expect(creature.select).toHaveBeenCalledWith(false, 197, 'Wolf');
    expect(router.navigate).toHaveBeenLastCalledWith(['creature/skinning-loot-template']);
    links.openLoot('gameobject', 1561, 'Chest');
    expect(gameobject.select).toHaveBeenCalledWith(false, 1561, 'Chest');
    expect(router.navigate).toHaveBeenLastCalledWith(['gameobject/gameobject-loot-template']);
  });
});
