import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Flag } from '@keira/shared/constants';

export interface FlagsModalConfig extends BaseModalConfig {
  flags: Flag[];
}
