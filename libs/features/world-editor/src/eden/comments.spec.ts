import { TestBed } from '@angular/core/testing';
import { COMMENT_COLOR, commentIdOf, commentMarkers, COMMENTS_KEY, CommentsService, EditorComment } from './comments';

const comment = (id: string, map: number, text = ''): EditorComment => ({ id, map, x: 1, y: 2, z: 3, title: `T${id}`, text });

describe('comments', () => {
  afterEach(() => localStorage.removeItem(COMMENTS_KEY));

  it('are markers of their map', () => {
    expect(commentMarkers([comment('1', 0, 'Boss here'), comment('2', 0), comment('3', 1)], 0)).toEqual([
      { key: 'comment:1', position: { x: 1, y: 2, z: 3 }, color: COMMENT_COLOR, label: 'T1 - Boss here' },
      { key: 'comment:2', position: { x: 1, y: 2, z: 3 }, color: COMMENT_COLOR, label: 'T2' },
    ]);
    expect(commentIdOf('comment:7')).toBe('7');
    expect(commentIdOf('creature:7')).toBeUndefined();
  });

  it('are kept on this computer', () => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify([comment('1', 0), { id: 2 }]));
    const service = TestBed.inject(CommentsService);
    expect(service.comments().map((c) => c.id)).toEqual(['1']);
    service.add(comment('2', 1));
    service.update('2', { text: 'Note' });
    expect(service.comments()[1].text).toBe('Note');
    service.remove('1');
    expect((JSON.parse(localStorage.getItem(COMMENTS_KEY) as string) as EditorComment[]).map((c) => c.id)).toEqual(['2']);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    service.remove('2');
    expect(service.comments()).toEqual([]);
    setItem.mockRestore();
    for (const stored of ['{', '{"a":1}']) {
      localStorage.setItem(COMMENTS_KEY, stored);
      TestBed.resetTestingModule();
      expect(TestBed.inject(CommentsService).comments()).toEqual([]);
    }
  });
});
