import { Injectable, isDevMode, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  readonly debugMode = signal<boolean>(isDevMode());
  readonly darkMode = signal<boolean>(false);
}
