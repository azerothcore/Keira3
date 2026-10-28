import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService } from '@keira/features/gameobject';
import { WorldEditorLinks } from '@keira/shared/constants';
import { SaiHandlerService } from '@keira/shared/sai-editor';

/** smart_scripts.source_type of area triggers. */
const SAI_AREATRIGGER = 2;

/** How the 3D world editor's right-click menu opens the creature and gameobject editors, their SAI and loot. */
export function worldEditorLinks(): WorldEditorLinks {
  const creature = inject(CreatureHandlerService);
  const gameobject = inject(GameobjectHandlerService);
  const router = inject(Router);
  const sai = inject(SaiHandlerService);
  return {
    openCreature: (entry, name) => creature.select(false, entry, name),
    openCreatureSai: (entry, name) => {
      creature.select(false, entry, name);
      void router.navigate(['creature/sai-creature']);
    },
    openGameObject: (entry, name) => gameobject.select(false, entry, name),
    openGameObjectSai: (entry, name) => {
      gameobject.select(false, entry, name);
      void router.navigate(['gameobject/sai-gameobject']);
    },
    openAreaTriggerSai: (id) => sai.selectFromEntity(SAI_AREATRIGGER, id),
    openLoot: (kind, entry, name) => {
      (kind === 'gameobject' ? gameobject : creature).select(false, entry, name);
      void router.navigate([kind === 'gameobject' ? 'gameobject/gameobject-loot-template' : `creature/${kind}-loot-template`]);
    },
  };
}
