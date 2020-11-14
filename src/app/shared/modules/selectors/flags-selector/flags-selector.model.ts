import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Flag } from '../../../types/general';

export interface FlagsModalConfig extends BaseModalConfig {
  flags: Flag[];
}
