import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-flags',
  templateUrl: './spell-dbc-flags.component.html',
})
export class SpellDbcFlagsComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
}
