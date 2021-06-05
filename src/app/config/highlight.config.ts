import { HighlightOptions } from 'ngx-highlightjs';

export const highlightOptions: HighlightOptions = {
  coreLibraryLoader: () => import('highlight.js/lib/core'),
  languages: {
    sql: () => import('highlight.js/lib/languages/sql'),
  },
};
