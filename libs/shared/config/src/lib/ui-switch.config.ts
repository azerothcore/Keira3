import type { UiSwitchModule } from 'ngx-ui-switch';

// ngx-ui-switch does not re-export UiSwitchModuleConfig from its package root and its exports
// map hides the deep path, so derive the config type from forRoot's signature.
type UiSwitchModuleConfig = NonNullable<Parameters<typeof UiSwitchModule.forRoot>[0]>;

export const uiSwitchConfig: UiSwitchModuleConfig = {
  size: 'small',
  color: 'rgb(0, 189, 99)',
  switchColor: '#FFF',
  switchOffColor: '#FFF',
  defaultBgColor: '#707375',
  defaultBoColor: '#476EFF',
  checkedLabel: '',
  uncheckedLabel: '',
};
