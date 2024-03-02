import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Flag } from '@keira/acore-world-model';

export interface FlagsModalConfig extends BaseModalConfig {
  flags: Flag[];
}
