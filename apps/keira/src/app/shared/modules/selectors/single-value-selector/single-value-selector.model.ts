import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Option } from '@keira/acore-world-model';

export interface SingleValueModalConfig extends BaseModalConfig {
  options: Option[];
}
