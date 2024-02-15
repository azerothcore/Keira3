import { QueryBuilderOptions } from 'squel';

export const squelConfig: QueryBuilderOptions = {
  autoQuoteTableNames: true,
  autoQuoteFieldNames: true,
  autoQuoteAliasNames: true,
  replaceSingleQuotes: true,
  singleQuoteReplacement: `\\'`,
};
