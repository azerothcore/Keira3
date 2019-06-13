import sql from 'highlight.js/lib/languages/sql';

export function hljsLanguages() {
  return [
    { name: 'sql', func: sql },
  ];
}

export const highlightOptions = {
  languages: hljsLanguages,
};
