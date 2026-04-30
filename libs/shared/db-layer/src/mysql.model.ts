import { ConnectionOptions } from 'mysql2';

export interface SshTunnelConfig {
  sshEnabled: boolean;
  sshHost: string;
  sshPort: number;
  sshUser: string;
  sshPassword: string;
  sshPrivateKey: string;
}

export type KeiraConnectionOptions = ConnectionOptions & { sslEnabled?: boolean } & Partial<SshTunnelConfig>;
