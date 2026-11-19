/**
 * The names of ids shown in a table (an item's, a creature's…), read once each, so the table can be sorted by them:
 * a column showing a name read later can't be sorted by its value (the id is), so it sorts with `compare`.
 */
export class NameCache {
  private readonly names = new Map<string, string>();

  /** `read` gives an id's name; `changed` is called when one comes (to show it). */
  constructor(
    private readonly read: (id: string | number) => Promise<string | null | undefined>,
    private readonly changed: () => void = () => undefined,
  ) {}

  /** An id's name ('' until it's read). */
  name(id: string | number): string {
    const key = String(id);
    if (!this.names.has(key)) {
      this.names.set(key, '');
      void this.read(id).then(
        (name) => {
          this.names.set(key, name ?? '');
          this.changed();
        },
        () => undefined,
      );
    }
    return this.names.get(key) as string;
  }

  /** Orders two ids by their names (for a table column's comparator). */
  readonly compare = (a: string | number, b: string | number): number => this.name(a).localeCompare(this.name(b));
}
