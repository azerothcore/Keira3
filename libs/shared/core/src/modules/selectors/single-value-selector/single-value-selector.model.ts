import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Option } from '@keira/shared/constants';

export interface SingleValueModalConfig extends BaseModalConfig {
  options: Option[];
}
