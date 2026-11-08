import { Injectable, signal } from '@angular/core';

/**
 * How Keira reaches the rest of the server besides the world database: the characters database (on the same MySQL
 * server, read with the same login) for the players, and the worldserver's SOAP for GM commands.
 */
export interface ServerSettings {
  /** The characters database's name (`acore_characters`). */
  charactersDatabase: string;
  /** The auth database's name (`acore_auth`): where Keira can make the SOAP account. */
  authDatabase: string;
  /** The worldserver's SOAP (worldserver.conf: SOAP.Enabled, SOAP.IP, SOAP.Port) and a GM account for it. */
  soapEnabled: boolean;
  soapHost: string;
  soapPort: number;
  soapUser: string;
  /** Kept on disk (encoded, not encrypted) only when `soapRememberPassword`; otherwise until Keira closes. */
  soapPassword: string;
  soapRememberPassword: boolean;
}

export const SERVER_SETTINGS_KEY = 'keira3.serverSettings';

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  charactersDatabase: 'acore_characters',
  authDatabase: 'acore_auth',
  soapEnabled: false,
  soapHost: '127.0.0.1',
  soapPort: 7878,
  soapUser: '',
  soapPassword: '',
  soapRememberPassword: false,
};

const encode = (text: string): string => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
const decode = (text: string): string => {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));
  } catch {
    return '';
  }
};

/** A database name safe to put in a query (letters, digits, `_` and `$`). */
export const isDatabaseName = (name: string): boolean => /^[\w$]{1,64}$/.test(name);

@Injectable({ providedIn: 'root' })
export class ServerSettingsService {
  readonly settings = signal<ServerSettings>(this.load());

  save(settings: Partial<ServerSettings>): void {
    const next = { ...this.settings(), ...settings };
    this.settings.set(next);
    try {
      const soapPassword = next.soapRememberPassword ? encode(next.soapPassword) : '';
      localStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify({ ...next, soapPassword }));
    } catch {
      // (storage blocked: kept until Keira closes)
    }
  }

  private load(): ServerSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(SERVER_SETTINGS_KEY) ?? '{}') as Partial<ServerSettings>;
      const typed = Object.fromEntries(
        Object.entries(stored).filter(
          ([key, value]) => key in DEFAULT_SERVER_SETTINGS && typeof value === typeof DEFAULT_SERVER_SETTINGS[key as keyof ServerSettings],
        ),
      );
      const settings = { ...DEFAULT_SERVER_SETTINGS, ...typed };
      return { ...settings, soapPassword: settings.soapRememberPassword ? decode(settings.soapPassword) : '' };
    } catch {
      return { ...DEFAULT_SERVER_SETTINGS };
    }
  }
}
