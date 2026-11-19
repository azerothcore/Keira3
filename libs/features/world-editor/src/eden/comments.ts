import { Service, signal } from '@angular/core';
import { WorldPosition } from '@keira/shared/wow-data';
import { WorldMarker } from '@keira/shared/world-viewer';

export const COMMENTS_KEY = 'keira3.worldEditor.comments';
export const COMMENT_KEY_PREFIX = 'comment:';
export const COMMENT_COLOR = 0x4fc3f7;

/** Eden's comment: a note left in the world, only in the editor (on this computer), never in the database. */
export interface EditorComment extends WorldPosition {
  id: string;
  map: number;
  title: string;
  text: string;
}

/** The comments of a map as markers, titled (and their text after a dash). */
export function commentMarkers(comments: EditorComment[], map: number): WorldMarker[] {
  return comments
    .filter((comment) => comment.map === map)
    .map((comment) => ({
      key: `${COMMENT_KEY_PREFIX}${comment.id}`,
      position: { x: comment.x, y: comment.y, z: comment.z },
      color: COMMENT_COLOR,
      label: comment.text ? `${comment.title} - ${comment.text}` : comment.title,
    }));
}

/** The comment a marker key is of, if any. */
export function commentIdOf(key: string): string | undefined {
  return key.startsWith(COMMENT_KEY_PREFIX) ? key.slice(COMMENT_KEY_PREFIX.length) : undefined;
}

function isComment(value: unknown): value is EditorComment {
  const comment = value as EditorComment;
  return typeof comment?.id === 'string' && typeof comment.map === 'number' && typeof comment.x === 'number';
}

function load(): EditorComment[] {
  try {
    const stored = JSON.parse(localStorage.getItem(COMMENTS_KEY) ?? '[]') as unknown;
    return Array.isArray(stored) ? stored.filter(isComment) : [];
  } catch {
    return [];
  }
}

/** The comments left on this computer. */
@Service()
export class CommentsService {
  private readonly _comments = signal<EditorComment[]>(load());
  readonly comments = this._comments.asReadonly();

  private keep(comments: EditorComment[]): void {
    this._comments.set(comments);
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch {
      // (not kept)
    }
  }

  add(comment: EditorComment): void {
    this.keep([...this.comments(), comment]);
  }

  update(id: string, change: Partial<Pick<EditorComment, 'title' | 'text'>>): void {
    this.keep(this.comments().map((comment) => (comment.id === id ? { ...comment, ...change } : comment)));
  }

  remove(id: string): void {
    this.keep(this.comments().filter((comment) => comment.id !== id));
  }
}
