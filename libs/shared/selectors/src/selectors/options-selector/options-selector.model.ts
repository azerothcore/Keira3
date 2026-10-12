import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Option } from '@keira/shared/constants';

export interface OptionsModalConfig extends BaseModalConfig {
  options: Option[];
}
