import { TableRow } from './general';

export class Conditions extends TableRow {
  SourceTypeOrReferenceId: number = 0;
  SourceGroup: number = 0;
  SourceEntry: number = 0;
  SourceId: number = 0;
  ElseGroup: number = 0;
  ConditionTypeOrReference: number = 0;
  ConditionTarget: number = 0;
  ConditionValue1: number = 0;
  ConditionValue2: number = 0;
  ConditionValue3: number = 0;
  NegativeCondition: number = 0;
  ErrorType: number = 0;
  ErrorTextId: number = 0;
  ScriptName: string = '';
  Comment: string = '';
}
