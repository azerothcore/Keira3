import { Injectable } from '@angular/core';

import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { SAI_EVENT_COMMENTS } from '@keira-shared/modules/sai-editor/constants/sai-comments';

@Injectable({
  providedIn: 'root'
})
export class SaiCommentGeneratorService {

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
}
