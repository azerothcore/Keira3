/**
 * Draws the 3D world editor's controls for the wiki: the keyboard and the gamepad, each in a light and a dark version,
 * and the tables of World-Editor-Controls.md, from the default bindings in
 * libs/shared/world-viewer/src/world-controls-settings.ts and the English names in apps/keira/src/assets/i18n/en.json.
 *
 * Run it after changing a default binding or adding an action:  npm run wiki:controls
 *
 * (A port of AbyssEngine's ControlsExport.c: same pictures, same colours, Keira's actions.)
 */
import '@angular/compiler';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTROL_ACTIONS,
  CONTROL_GROUPS,
  ControlAction,
  ControlGroup,
  DEFAULT_WORLD_CONTROLS_SETTINGS,
  inputConflict,
  inputLabel,
} from '../../libs/shared/world-viewer/src/world-controls-settings';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'TODO_wiki');
const settings = DEFAULT_WORLD_CONTROLS_SETTINGS;
const en = JSON.parse(readFileSync(join(ROOT, 'apps/keira/src/assets/i18n/en.json'), 'utf8')).WORLD_EDITOR as Record<string, string>;
const actionName = (action: ControlAction): string => en[`CONTROL_${action.toUpperCase()}`] ?? action;
const groupName = (group: ControlGroup): string => en[`CONTROL_GROUP_${group.toUpperCase()}`] ?? group;
const groupOf = (action: ControlAction): ControlGroup => CONTROL_ACTIONS.find((a) => a.action === action)!.group;
const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Light colours for the groups (camera, marker, editing, panels), then more if groups are added. */
const GROUP_COLORS = ['#9696dc', '#e68c8c', '#e6c878', '#96dca0', '#78c8dc', '#c8a0e6', '#c8c8c8', '#f0aa5a'];
const groupColor = (group: ControlGroup): string => GROUP_COLORS[CONTROL_GROUPS.indexOf(group)];

/** Every light colour and its dark counterpart (the dark pictures are the light ones with these swapped). */
const DARK: [string, string][] = [
  ['#f4f4f4', '#1b1b1f'], // background
  ['#111111', '#e6e6e6'], // text
  ['#ffffff', '#2c2c31'], // a key with nothing on it
  ['#606060', '#7a7a80'], // key outline
  ['#909090', '#7c7c84'], // (free)
  ['#707070', '#8c8c94'], // leader lines
  ['#505050', '#8a8a90'], // pad outline
  ['#404040', '#18181b'], // D-pad and face button outlines
  ['#d6d6d6', '#3a3a40'], // pad body
  ['#bdbdbd', '#2c2c31'], // bumpers
  ['#9a9a9a', '#55555c'], // sticks
  ['#7a7a7a', '#44444a'],
  ['#8a8a8a', '#5c5c64'], // the four buttons
  ['#f0f0f0', '#d8d8dc'], // their arrows
  ['#6a6a6a', '#202024'], // D-pad, Select / Home / Start
  ['#9696dc', '#4b4b94'], // the groups, deeper so light text reads on them
  ['#e68c8c', '#8f3d3d'],
  ['#e6c878', '#8a7230'],
  ['#96dca0', '#3b7a47'],
  ['#78c8dc', '#2e6e80'],
  ['#c8a0e6', '#6c4b8c'],
  ['#c8c8c8', '#5a5a60'],
  ['#f0aa5a', '#95602a'],
  ['#e02020', '#ff4a4a'], // clashes
  ['#d01010', '#ff5a5a'],
];
const dark = (svg: string): string => svg.replace(/#[0-9a-f]{6}/g, (color) => DARK.find(([light]) => light === color)?.[1] ?? color);

/** The actions an input is on, and whether one of them clashes with another. */
function actionsOn(input: string): { actions: ControlAction[]; clash: boolean } {
  const actions = CONTROL_ACTIONS.map((a) => a.action).filter((action) => settings.bindings[action].includes(input));
  return { actions, clash: actions.some((action) => inputConflict(settings, action, input) === 'clash') };
}

// ---------------------------------------------------------------------------------------------------------------- keyboard

/** The keyboard, row by row: KeyboardEvent.code, label, width in quarter keys (4 = one key); '' = a gap. */
const KEYBOARD: [string, string, number][][] = [
  [
    ['Escape', 'Esc', 4],
    ['', '', 2],
    ...[1, 2, 3, 4].map((n): [string, string, number] => [`F${n}`, `F${n}`, 4]),
    ['', '', 2],
    ...[5, 6, 7, 8].map((n): [string, string, number] => [`F${n}`, `F${n}`, 4]),
    ['', '', 2],
    ...[9, 10, 11, 12].map((n): [string, string, number] => [`F${n}`, `F${n}`, 4]),
    ['', '', 2],
    ['PrintScreen', 'PrtSc', 4],
    ['Home', 'Home', 4],
  ],
  [
    ['Backquote', '`', 4],
    ...'1234567890'.split('').map((d): [string, string, number] => [`Digit${d}`, d, 4]),
    ['Minus', '-', 4],
    ['Equal', '=', 4],
    ['Backspace', 'Back', 8],
    ['', '', 2],
    ['Insert', 'Ins', 4],
    ['PageUp', 'PgUp', 4],
  ],
  [
    ['Tab', 'Tab', 6],
    ...'QWERTYUIOP'.split('').map((k): [string, string, number] => [`Key${k}`, k, 4]),
    ['BracketLeft', '[', 4],
    ['BracketRight', ']', 4],
    ['Backslash', '\\', 6],
    ['', '', 2],
    ['Delete', 'Del', 4],
    ['PageDown', 'PgDn', 4],
  ],
  [
    ['CapsLock', 'Caps', 7],
    ...'ASDFGHJKL'.split('').map((k): [string, string, number] => [`Key${k}`, k, 4]),
    ['Semicolon', ';', 4],
    ['Quote', "'", 4],
    ['Enter', 'Enter', 9],
    ['', '', 2],
    ['End', 'End', 4],
  ],
  [
    ['ShiftLeft', 'Shift', 9],
    ...'ZXCVBNM'.split('').map((k): [string, string, number] => [`Key${k}`, k, 4]),
    ['Comma', ',', 4],
    ['Period', '.', 4],
    ['Slash', '/', 4],
    ['ShiftRight', 'Shift', 11],
    ['', '', 6],
    ['ArrowUp', 'Up', 4],
  ],
  [
    ['ControlLeft', 'Ctrl', 6],
    ['MetaLeft', 'Win', 5],
    ['AltLeft', 'Alt', 5],
    ['Space', 'Space', 25],
    ['AltRight', 'Alt', 5],
    ['ControlRight', 'Ctrl', 6],
    ['', '', 2],
    ['ArrowLeft', 'Left', 4],
    ['ArrowDown', 'Down', 4],
    ['ArrowRight', 'Right', 4],
  ],
];

/** A plain key (no modifier, no double tap), as on the keyboard picture. */
const plainKey = (input: string): boolean => !/[+]|^2x |^(Mouse|Wheel|Pad)/.test(input);

function keyboardSvg(): string {
  const unit = 20;
  const keyH = 62;
  const step = 68;
  const margin = 20;
  const width = 76 * unit + 2 * margin;
  const top = 50;
  const legend = top + 6 * step + 20;
  const extra = CONTROL_ACTIONS.filter(({ action }) => settings.bindings[action].some((input) => !plainKey(input)));
  const height = legend + 90 + Math.ceil(extra.length / 3) * 16;
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="#111111">`,
    '<rect width="100%" height="100%" fill="#f4f4f4"/>',
    `<text x="${margin}" y="30" font-size="20" font-weight="bold">Keira3 world editor: keyboard</text>`,
  ];
  KEYBOARD.forEach((row, r) => {
    let x = margin;
    for (const [code, label, quarters] of row) {
      const w = quarters * unit;
      if (code) {
        const y = top + r * step + (r > 0 ? 10 : 0);
        const { actions, clash } = actionsOn(code);
        const fill = actions.length ? groupColor(groupOf(actions[0])) : '#ffffff';
        out.push(
          `<rect x="${x + 2}" y="${y}" width="${w - 4}" height="${keyH}" rx="6" fill="${fill}" stroke="${clash ? '#e02020' : '#606060'}" stroke-width="${clash ? 3 : 1}"/>`,
          `<text x="${x + 8}" y="${y + 16}" font-size="13" font-weight="bold">${escape(label)}</text>`,
        );
        // its actions, one line each, cut short to fit
        actions.slice(0, 3).forEach((action, a) => {
          const chars = Math.floor((w - 12) / 5);
          let name = actionName(action);
          if (name.length > chars && chars > 2) {
            name = `${name.slice(0, chars - 1)}.`;
          }
          out.push(`<text x="${x + 8}" y="${y + 31 + a * 12}" font-size="9.5">${escape(name)}</text>`);
        });
      }
      x += w;
    }
  });
  let lx = margin;
  for (const group of CONTROL_GROUPS) {
    out.push(
      `<rect x="${lx}" y="${legend}" width="14" height="14" fill="${groupColor(group)}" stroke="#606060"/>`,
      `<text x="${lx + 20}" y="${legend + 12}" font-size="13">${escape(groupName(group))}</text>`,
    );
    lx += 32 + groupName(group).length * 7;
  }
  out.push(
    `<text x="${margin}" y="${legend + 36}" font-size="12">Keys without Ctrl, Shift or Alt. Red border: the key clashes with another action (the first in the list wins).</text>`,
    `<text x="${margin}" y="${legend + 62}" font-size="13" font-weight="bold">Mouse, gamepad and combinations</text>`,
  );
  extra.forEach(({ action }, line) => {
    const inputs = settings.bindings[action].filter((input) => !plainKey(input)).map(inputLabel);
    out.push(
      `<text x="${margin + (line % 3) * 520}" y="${legend + 82 + Math.floor(line / 3) * 16}" font-size="11">${escape(actionName(action))}: ${escape(inputs.join(', '))}</text>`,
    );
  });
  out.push('</svg>');
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------------------------------------------------------- gamepad

interface Callout {
  title: string;
  /** 0 left column, 1 right column, 2 under the pad */
  side: 0 | 1 | 2;
  y: number;
  target: [number, number];
  parts: [string, string][];
}

/** Each column is ordered so that its leader lines fan out without crossing (and miss the D-pad and buttons). */
const CALLOUTS: Callout[] = [
  { title: 'Left trigger (Button 7)', side: 0, y: 60, target: [410, 175], parts: [['', 'PadLT']] },
  { title: 'Left bumper (Button 5)', side: 0, y: 110, target: [395, 207], parts: [['', 'PadLB']] },
  { title: 'Select (Button 9)', side: 0, y: 165, target: [505, 278], parts: [['', 'PadSelect']] },
  {
    title: 'D-pad',
    side: 0,
    y: 215,
    target: [387, 285],
    parts: [
      ['Up', 'PadDpadUp'],
      ['Down', 'PadDpadDown'],
      ['Left', 'PadDpadLeft'],
      ['Right', 'PadDpadRight'],
    ],
  },
  {
    title: 'Left stick',
    side: 0,
    y: 315,
    target: [446, 375],
    parts: [
      ['Up', 'PadLeftStickUp'],
      ['Down', 'PadLeftStickDown'],
      ['Left', 'PadLeftStickLeft'],
      ['Right', 'PadLeftStickRight'],
      ['Press (Button 11)', 'PadLeftStickPress'],
    ],
  },
  { title: 'Right trigger (Button 8)', side: 1, y: 60, target: [690, 175], parts: [['', 'PadRT']] },
  { title: 'Right bumper (Button 6)', side: 1, y: 110, target: [705, 207], parts: [['', 'PadRB']] },
  { title: 'Start (Button 10)', side: 1, y: 165, target: [595, 278], parts: [['', 'PadStart']] },
  {
    title: 'Buttons (Y, A, X, B)',
    side: 1,
    y: 215,
    target: [726, 285],
    parts: [
      ['Up, Y (Button 4)', 'PadY'],
      ['Down, A (Button 2)', 'PadA'],
      ['Left, X (Button 1)', 'PadX'],
      ['Right, B (Button 3)', 'PadB'],
    ],
  },
  {
    title: 'Right stick',
    side: 1,
    y: 315,
    target: [654, 375],
    parts: [
      ['Up', 'PadRightStickUp'],
      ['Down', 'PadRightStickDown'],
      ['Left', 'PadRightStickLeft'],
      ['Right', 'PadRightStickRight'],
      ['Press (Button 12)', 'PadRightStickPress'],
    ],
  },
  { title: 'Home (Button 13)', side: 2, y: 462, target: [550, 343], parts: [['', 'PadHome']] },
];

/** "Move up, 2x Compass": every action on a pad input, with modifiers or a double tap said so. */
function padActions(input: string): { text: string; clash: boolean } {
  const names: string[] = [];
  let clash = false;
  for (const { action } of CONTROL_ACTIONS) {
    for (const binding of settings.bindings[action]) {
      const twice = binding.startsWith('2x ');
      const parts = binding.replace(/^2x /, '').split('+');
      if (parts.at(-1) === input) {
        names.push(
          `${twice ? '2x ' : ''}${parts
            .slice(0, -1)
            .map((mod) => `${mod}+`)
            .join('')}${actionName(action)}`,
        );
        clash ||= inputConflict(settings, action, binding) === 'clash';
      }
    }
  }
  return { text: names.join(', '), clash };
}

function gamepadSvg(): string {
  // (wider than the pad: room for long action names in the right column)
  const width = 1200;
  const height = 620;
  const body = 'fill="#d6d6d6" stroke="#505050" stroke-width="2"';
  const stick = (x: number, y: number) => [
    `<circle cx="${x}" cy="${y}" r="34" fill="#9a9a9a" stroke="#505050" stroke-width="2"/>`,
    `<circle cx="${x}" cy="${y}" r="26" fill="#7a7a7a" stroke="#404040" stroke-width="1.5"/>`,
    `<circle cx="${x}" cy="${y}" r="19" fill="#6a6a6a"/>`,
    `<circle cx="${x}" cy="${y}" r="21" fill="none" stroke="#9a9a9a" stroke-width="2"/>`,
  ];
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="#111111">`,
    '<rect width="100%" height="100%" fill="#f4f4f4"/>',
    '<text x="20" y="30" font-size="20" font-weight="bold">Keira3 world editor: gamepad</text>',
    `<rect x="385" y="160" width="95" height="32" rx="10" ${body}/>`,
    `<rect x="620" y="160" width="95" height="32" rx="10" ${body}/>`,
    '<rect x="378" y="196" width="110" height="22" rx="8" fill="#bdbdbd" stroke="#505050" stroke-width="2"/>',
    '<rect x="612" y="196" width="110" height="22" rx="8" fill="#bdbdbd" stroke="#505050" stroke-width="2"/>',
    `<path d="M 380 215 L 720 215 Q 790 215 810 290 L 845 450 Q 860 530 800 535 Q 755 538 725 470 L 690 420 L 410 420 L 375 470 Q 345 538 300 535 Q 240 530 255 450 L 290 290 Q 310 215 380 215 Z" ${body}/>`,
  ];
  // leader lines: from the label straight to the control
  for (const { side, y, target } of CALLOUTS) {
    const [fx, fy] = side === 2 ? [target[0], y - 13] : [side === 1 ? 845 : 255, y - 4];
    out.push(`<line x1="${fx}" y1="${fy}" x2="${target[0]}" y2="${target[1]}" stroke="#707070" stroke-width="1.2"/>`);
  }
  // D-pad, the four buttons (each with an arrow for where it is), Select / Start / Home, the sticks
  for (const points of [
    '409,252 431,252 431,272 420,282 409,272',
    '409,318 431,318 431,298 420,288 409,298',
    '387,274 407,274 417,285 407,296 387,296',
    '453,274 433,274 423,285 433,296 453,296',
  ]) {
    out.push(`<polygon points="${points}" fill="#6a6a6a" stroke="#404040" stroke-width="1.5"/>`);
  }
  for (const [x, y, arrow] of [
    [680, 253, '0,-6 -5,3 5,3'],
    [648, 285, '-6,0 3,-5 3,5'],
    [712, 285, '6,0 -3,-5 -3,5'],
    [680, 317, '0,6 -5,-3 5,-3'],
  ] as const) {
    out.push(
      `<circle cx="${x}" cy="${y}" r="14" fill="#8a8a8a" stroke="#404040" stroke-width="1.5"/>`,
      `<polygon points="${arrow}" transform="translate(${x} ${y})" fill="#f0f0f0"/>`,
    );
  }
  out.push(
    '<rect x="494" y="279" width="22" height="12" rx="4" fill="#6a6a6a"/>',
    '<polygon points="584,279 606,285 584,291" fill="#6a6a6a"/>',
    '<circle cx="550" cy="330" r="13" fill="#6a6a6a" stroke="#404040"/>',
    ...stick(480, 375),
    ...stick(620, 375),
  );
  for (const { side, target } of CALLOUTS) {
    if (side !== 2) {
      out.push(`<circle cx="${target[0]}" cy="${target[1]}" r="3" fill="#707070"/>`);
    }
  }
  const line = 15;
  for (const { title, side, y, parts } of CALLOUTS) {
    const x = side === 2 ? 550 : side === 1 ? 850 : 250;
    const anchor = side === 2 ? 'middle' : side === 1 ? 'start' : 'end';
    out.push(`<text x="${x}" y="${y}" font-size="13" font-weight="bold" text-anchor="${anchor}">${escape(title)}</text>`);
    parts.forEach(([label, input], p) => {
      const { text, clash } = padActions(input);
      const fill = clash ? ' fill="#d01010"' : text ? '' : ' fill="#909090"';
      out.push(
        `<text x="${x}" y="${y + (p + 1) * line}" font-size="11" text-anchor="${anchor}"${fill}>${label ? `${escape(label)}: ` : ''}${escape(text || '(free)')}</text>`,
      );
    });
  }
  out.push(
    `<text x="20" y="${height - 54}" font-size="12">Buttons are named as on an Xbox pad and numbered as Windows' game controller settings number them; other pads have the same ones in the same places.</text>`,
    `<text x="20" y="${height - 34}" font-size="12">Red: clashes with another action. (free): nothing on it yet. The gamepad works in the world editor only, for the camera and the marker.</text>`,
    '</svg>',
  );
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------------------------------------------------------- tables

function tables(): string {
  const lines: string[] = [];
  for (const group of CONTROL_GROUPS) {
    lines.push(`### ${groupName(group)}`, '', '| Action | Mouse | Keyboard | Controller | Note |', '|---|---|---|---|---|');
    for (const { action } of CONTROL_ACTIONS.filter((a) => a.group === group)) {
      const inputs = settings.bindings[action];
      const column = (test: (input: string) => boolean) =>
        inputs
          .filter(test)
          .map((input) => `\`${inputLabel(input)}\``)
          .join(', ') || '-';
      const clash = inputs.find((input) => inputConflict(settings, action, input) === 'clash');
      lines.push(
        `| ${actionName(action)} | ${column((i) => /(^|\+)(Mouse|Wheel)/.test(i))} | ${column((i) => !/(Mouse|Wheel|Pad)/.test(i))} | ${column((i) => /(^|\+|2x )Pad/.test(i))} | ${clash ? `\`${inputLabel(clash)}\` clashes with another action` : ''} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

const page = join(OUT, 'World-Editor-Controls.md');
const markdown = readFileSync(page, 'utf8');
const [start, end] = ['<!-- controls:start -->', '<!-- controls:end -->'];
if (!markdown.includes(start) || !markdown.includes(end)) {
  throw new Error(`${page} lost its ${start} / ${end} markers`);
}
writeFileSync(
  page,
  `${markdown.slice(0, markdown.indexOf(start) + start.length)}\n\n${tables()}\n${markdown.slice(markdown.indexOf(end))}`,
);
const keyboard = keyboardSvg();
const gamepad = gamepadSvg();
writeFileSync(join(OUT, 'world-editor-controls-keyboard.svg'), keyboard);
writeFileSync(join(OUT, 'world-editor-controls-keyboard-dark.svg'), dark(keyboard));
writeFileSync(join(OUT, 'world-editor-controls-gamepad.svg'), gamepad);
writeFileSync(join(OUT, 'world-editor-controls-gamepad-dark.svg'), dark(gamepad));
console.log('Updated the world editor controls in TODO_wiki/');
