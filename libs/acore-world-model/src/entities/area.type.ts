import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const AREA_TABLE = 'areas_and_zones'; // sqlite
export const AREA_ID = 'm_ID';
export const AREA_SEARCH_FIELDS = [AREA_ID, 'm_ParentAreaID', 'm_AreaName_lang'];

export class Area extends TableRow {
  m_ID: number = 0;
  m_ParentAreaID: number = 0;
  m_AreaName_lang: string = '';
}
