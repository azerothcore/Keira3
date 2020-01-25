import { Injectable } from '@angular/core';

import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { SAI_EVENT_COMMENTS } from '@keira-shared/modules/sai-editor/constants/sai-comments';
import { QueryService } from '@keira-shared/services/query.service';
import { SAI_TARGETS } from '@keira-shared/modules/sai-editor/constants/sai-targets';

@Injectable({
  providedIn: 'root'
})
export class SaiCommentGeneratorService {

  constructor(
    private queryService: QueryService,
  ) {}

  private getStringByTargetType(smartScript: SmartScripts): string {
    switch (smartScript.target_type) {
      case SAI_TARGETS.SELF:
        return 'Self';
      case SAI_TARGETS.VICTIM:
        return 'Victim';
      case SAI_TARGETS.HOSTILE_SECOND_AGGRO:
        return 'Second On Threatlist';
      case SAI_TARGETS.HOSTILE_LAST_AGGRO:
        return 'Last On Threatlist';
      case SAI_TARGETS.HOSTILE_RANDOM:
        return 'Random On Threatlist';
      case SAI_TARGETS.HOSTILE_RANDOM_NOT_TOP:
        return 'Random On Threatlist Not Top';
      case SAI_TARGETS.ACTION_INVOKER:
        return 'Invoker';
      case SAI_TARGETS.POSITION:
        return 'Position';
      case SAI_TARGETS.CREATURE_RANGE:
      case SAI_TARGETS.CREATURE_DISTANCE:
      case SAI_TARGETS.CLOSEST_CREATURE:
        return `Closest Creature '${this.queryService.getCreatureNameById(smartScript.target_param1)}'`;
      case SAI_TARGETS.CREATURE_GUID:
        return `Closest Creature '${this.queryService.getCreatureNameByGuid(smartScript.target_param1)}'`;
      case SAI_TARGETS.GAMEOBJECT_RANGE:
      case SAI_TARGETS.GAMEOBJECT_DISTANCE:
      case SAI_TARGETS.CLOSEST_GAMEOBJECT:
        return `Closest Creature '${this.queryService.getGameObjectNameById(smartScript.target_param1)}'`;
      case SAI_TARGETS.GAMEOBJECT_GUID:
        return `Closest Creature '${this.queryService.getGameObjectNameByGuid(smartScript.target_param1)}'`;
      case SAI_TARGETS.INVOKER_PARTY:
        return 'Invoker\'s Party';
      case SAI_TARGETS.PLAYER_RANGE:
      case SAI_TARGETS.PLAYER_DISTANCE:
      case SAI_TARGETS.CLOSEST_PLAYER:
        return 'Closest Player';
      case SAI_TARGETS.ACTION_INVOKER_VEHICLE:
        return `Invoker's Vehicle`;
      case SAI_TARGETS.OWNER_OR_SUMMONER:
        return 'Owner Or Summoner';
      case SAI_TARGETS.THREAT_LIST:
        return 'First Unit On Threatlist';
      case SAI_TARGETS.CLOSEST_ENEMY:
        return 'Closest Enemy';
      case SAI_TARGETS.CLOSEST_FRIENDLY:
        return 'Closest Friendly Unit';
      default:
        return '[unsupported target type]';
    }
  }

  /* Get previous script of links chain */
  private getPreviousScriptLink(rows: SmartScripts[], smartScript: SmartScripts): SmartScripts {
    if (smartScript.id === 0) {
      return null;
    }

    for (const row of rows) {
      if (row.link === smartScript.id) {
        // if previous is LINK, return previous of previous
        if (row.event_type === SAI_EVENTS.LINK) {
          return this.getPreviousScriptLink(rows, row);
        } else {
          return row;
        }
      }
    }
  }

  generateComment(
    rows: SmartScripts[], // the set of smart_scripts rows
    smartScript: SmartScripts, // the specific row that we are generating the comment for
    name: string, // the name of the creature or gameobject
  ): string {
    const smartScriptLink = this.getPreviousScriptLink(rows, smartScript);
    let fullLine = '';

    switch (smartScript.source_type) {

      case SAI_TYPES.SAI_TYPE_CREATURE:
        fullLine += name + ' - ';
        fullLine += SAI_EVENT_COMMENTS[smartScript.event_type];
        break;

      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        fullLine += name + ' - ';
        fullLine += SAI_EVENT_COMMENTS[smartScript.event_type];
        break;

      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        fullLine += 'Areatrigger - ';

        switch (smartScript.event_type) {
          case SAI_EVENTS.AREATRIGGER_ONTRIGGER:
          case SAI_EVENTS.LINK:
            fullLine += 'On Trigger';
            break;
          default:
            fullLine += 'INCORRECT EVENT TYPE';
            break;
        }

        break;

      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        // TODO: comment generation of actionlist scripts
        break;
    }

    return fullLine;
  }
}
