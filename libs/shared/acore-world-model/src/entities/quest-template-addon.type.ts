import { TableRow } from '@keira/shared/constants';

export const QUEST_TEMPLATE_ADDON_TABLE = 'quest_template_addon';
export const QUEST_TEMPLATE_ADDON_ID = 'ID';

export class QuestTemplateAddon extends TableRow {
  ID: number = 0;
  MaxLevel: number = 0;
  AllowableClasses: number = 0;
  SourceSpellID: number = 0;
  PrevQuestID: number = 0;
  NextQuestID: number = 0;
  ExclusiveGroup: number = 0;
  RewardMailTemplateID: number = 0;
  RewardMailDelay: number = 0;
  RequiredSkillID: number = 0;
  RequiredSkillPoints: number = 0;
  RequiredMinRepFaction: number = 0;
  RequiredMaxRepFaction: number = 0;
  RequiredMinRepValue: number = 0;
  RequiredMaxRepValue: number = 0;
  ProvidedItemCount: number = 0;
  SpecialFlags: number = 0;
}
