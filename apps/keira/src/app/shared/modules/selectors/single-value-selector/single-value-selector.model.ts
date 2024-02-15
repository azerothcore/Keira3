import { BaseModalConfig } from '../base-selector/base-selector.model';
import { Option } from '../../../types/general';

export interface SingleValueModalConfig extends BaseModalConfig {
  options: Option[];
}
