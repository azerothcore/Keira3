import { computed, inject } from '@angular/core';
import { WowDataSettingsService } from '@keira/shared/wow-data';

/** Whether the AzerothCore source folder is set (Settings): the pages reading the scripts need it. */
export function sourceFolderSet() {
  const settings = inject(WowDataSettingsService);
  return computed(() => !!settings.paths().sourcePath);
}
