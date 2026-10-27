import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { WorldEditorLinks } from '@keira/shared/constants';

/** How the 3D world editor's right-click menu opens the creature, creature SAI and gameobject editors. */
export function worldEditorLinks(): WorldEditorLinks {
  const creature = inject(CreatureHandlerService);
  const gameobject = inject(GameobjectHandlerService);
  const router = inject(Router);
  return {
    openCreature: (entry, name) => creature.select(false, entry, name),
    openCreatureSai: (entry, name) => {
      creature.select(false, entry, name);
      void router.navigate(['creature/sai-creature']);
    },
    openGameObject: (entry, name) => gameobject.select(false, entry, name),
  };
}
