import { ConnectionOptions } from 'mysql2';

export type KeiraConnectionOptions = ConnectionOptions & { sslEnabled?: boolean };
