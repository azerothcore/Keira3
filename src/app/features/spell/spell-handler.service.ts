import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { SPELL_DBC_TABLE, SpellDbc } from '@keira-types/spell-dbc.type';

@Injectable()
export class SpellHandlerService extends HandlerService<SpellDbc> {

  get isSpellDbcUnsaved(): boolean { return this.statusMap[SPELL_DBC_TABLE]; }

  protected _statusMap = {
    [SPELL_DBC_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'spell/spell-dbc',
      router,
    );
  }
}
