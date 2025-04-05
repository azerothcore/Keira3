import { TableRow } from '@keira/shared/constants';

export const QUEST_TEMPLATE_LOCALE_TABLE = 'quest_template_locale';
export const QUEST_TEMPLATE_LOCALE_ID = 'ID';
export const QUEST_TEMPLATE_LOCALE_ID_2 = 'locale';

export class QuestTemplateLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  Title: string = '';
  Details: string = '';
  Objectives: string = '';
  EndText: string = '';
  CompletedText: string = '';
  ObjectiveText1: string = '';
  ObjectiveText2: string = '';
  ObjectiveText3: string = '';
  ObjectiveText4: string = '';
  VerifiedBuild: number = 0;
}
