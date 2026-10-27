import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { vi } from 'vitest';
import { worldEditorLinks } from './world-editor-links';

describe('worldEditorLinks', () => {
  it('opens the creature, its SAI and gameobjects through their handlers', () => {
    const creature = { select: vi.fn() };
    const gameobject = { select: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: CreatureHandlerService, useValue: creature },
        { provide: GameobjectHandlerService, useValue: gameobject },
        { provide: Router, useValue: router },
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
  });
});
