import { inject, Injectable } from '@angular/core';
import { isDatabaseName, ServerSettingsService } from '@keira/shared/common-services';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TableRow } from '@keira/shared/constants';
import { firstValueFrom } from 'rxjs';
import { escape } from 'sqlstring';
import { hexLiteral, MAX_ACCOUNT_LENGTH, MAX_PASSWORD_LENGTH, srp6Registration, upperLatin } from './srp6';

/** The GM level SOAP needs (SEC_ADMINISTRATOR), on every realm (-1). */
export const SOAP_GM_LEVEL = 3;
/** The expansion of a new account (WotLK). */
const EXPANSION = 2;

/** A name for a new SOAP account: `Keira` and 7 digits. */
export const generateAccountName = (): string =>
  `Keira${String(crypto.getRandomValues(new Uint32Array(1))[0] % 10_000_000).padStart(7, '0')}`;

const PASSWORD_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
/** A random password as long as the core allows (16). */
export const generatePassword = (): string =>
  [...crypto.getRandomValues(new Uint8Array(MAX_PASSWORD_LENGTH))].map((byte) => PASSWORD_LETTERS[byte % PASSWORD_LETTERS.length]).join('');

/** Why a name or password can't make an account, or '' when they can. */
export function accountProblem(name: string, password: string): string {
  if (!/^[A-Za-z0-9]{1,17}$/.test(name)) {
    return `The name must be 1 to ${MAX_ACCOUNT_LENGTH} letters or digits.`;
  }
  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    return `The password must be 1 to ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return '';
}

/**
 * Makes a game account for SOAP in the auth database, as the worldserver's `account create` and `account set gmlevel …
 * 3 -1` would: the account (name, salt, verifier), its GM level 3 on every realm, and its characters count per realm.
 */
@Injectable({ providedIn: 'root' })
export class SoapAccountService {
  private readonly queryService = inject(MysqlQueryService);
  private readonly server = inject(ServerSettingsService);

  /** The SQL making the account (to run here, or to copy and run elsewhere). */
  async sql(name: string, password: string): Promise<string> {
    const problem = accountProblem(name, password);
    if (problem) {
      throw new Error(problem);
    }
    const auth = this.authDatabase();
    const username = escape(upperLatin(name));
    const { salt, verifier } = await srp6Registration(name, password);
    return [
      `INSERT INTO \`${auth}\`.\`account\` (\`username\`, \`salt\`, \`verifier\`, \`expansion\`, \`reg_mail\`, \`email\`, \`joindate\`) ` +
        `VALUES (${username}, ${hexLiteral(salt)}, ${hexLiteral(verifier)}, ${EXPANSION}, '', '', NOW());`,
      `INSERT INTO \`${auth}\`.\`account_access\` (\`id\`, \`gmlevel\`, \`RealmID\`) ` +
        `SELECT \`id\`, ${SOAP_GM_LEVEL}, -1 FROM \`${auth}\`.\`account\` WHERE \`username\` = ${username};`,
      `INSERT INTO \`${auth}\`.\`realmcharacters\` (\`realmid\`, \`acctid\`, \`numchars\`) ` +
        `SELECT \`r\`.\`id\`, \`a\`.\`id\`, 0 FROM \`${auth}\`.\`realmlist\` \`r\`, \`${auth}\`.\`account\` \`a\` WHERE \`a\`.\`username\` = ${username};`,
    ].join('\n');
  }

  /** Makes the account here (refusing a name already taken), and keeps it as the SOAP login. */
  async create(name: string, password: string): Promise<void> {
    const sql = await this.sql(name, password);
    const taken = await firstValueFrom(
      this.queryService.query<TableRow>(
        `SELECT \`id\` FROM \`${this.authDatabase()}\`.\`account\` WHERE \`username\` = ${escape(upperLatin(name))}`,
      ),
    );
    if (taken?.length) {
      throw new Error(`The account ${upperLatin(name)} already exists.`);
    }
    for (const statement of sql.split('\n')) {
      await firstValueFrom(this.queryService.query(statement));
    }
    this.server.save({ soapUser: name, soapPassword: password });
  }

  private authDatabase(): string {
    const auth = this.server.settings().authDatabase;
    if (!isDatabaseName(auth)) {
      throw new Error(`"${auth}" is not a database name.`);
    }
    return auth;
  }
}
