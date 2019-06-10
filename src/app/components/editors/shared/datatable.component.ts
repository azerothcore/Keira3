import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

export abstract class DatatableComponent {
  public readonly DTCFG = {
    columnMode: ColumnMode.force,
    limit: 20,
    headerHeight: 50,
    footerHeight: 50,
    rowHeight: 30,
    selectionType: SelectionType.single,
  };
}
