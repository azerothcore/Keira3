import { Conditions } from '@keira/shared/acore-world-model';
import { conditionRowId, conditionsSourceQuery } from './conditions-source-query';

describe('conditionsSourceQuery', () => {
  it('deletes the source, a missing key as 0, and inserts the rows, escaping texts and empty cells', () => {
    const row = Object.assign(new Conditions(), { SourceEntry: 5, Comment: "Anub'Rekhan", ScriptName: null as unknown as string });

    expect(conditionsSourceQuery({ SourceEntry: 5 }, [row])).toBe(
      'DELETE FROM `conditions` WHERE `SourceTypeOrReferenceId` = 0 AND `SourceGroup` = 0 AND `SourceEntry` = 5 AND `SourceId` = 0;\n' +
        'INSERT INTO `conditions` (`SourceTypeOrReferenceId`, `SourceGroup`, `SourceEntry`, `SourceId`, `ElseGroup`, `ConditionTypeOrReference`, ' +
        '`ConditionTarget`, `ConditionValue1`, `ConditionValue2`, `ConditionValue3`, `NegativeCondition`, `ErrorType`, `ErrorTextId`, `ScriptName`, `Comment`) VALUES\n' +
        "(0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 'Anub\\'Rekhan');\n",
    );
    expect(conditionRowId(row)).toBe('0_0_0_0_0_0');
  });
});
