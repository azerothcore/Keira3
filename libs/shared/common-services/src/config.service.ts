import { Service, isDevMode, signal } from '@angular/core';

@Service()
export class ConfigService {
  readonly debugMode = signal<boolean>(isDevMode());
  readonly darkMode = signal<boolean>(false);
}
