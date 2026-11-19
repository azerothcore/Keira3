# TODO_wiki

Pages and pictures for the Keira3 wiki that aren't published there yet. Copy them over as they are (the pictures are
referenced by file name, next to the pages).

| File | What it is |
|---|---|
| `World-Editor-Controls.md` | The 3D world editor's controls: bindable actions (generated), fixed mouse controls, the controller |
| `World-Editor-Internals.md` | How the 3D world editor is built: libraries, data flow, rendering, caches, settings, tests |
| `world-editor-controls-keyboard.svg`, `-dark.svg` | The keyboard with the default bindings, light and dark |
| `world-editor-controls-gamepad.svg`, `-dark.svg` | The gamepad with the default bindings, light and dark |
| `scripts/update-controls.ts` | Writes the four pictures and the tables of the controls page |

After changing a default binding (`DEFAULT_CONTROL_BINDINGS` in `libs/shared/world-viewer/src/world-controls-settings.ts`),
adding an action, or renaming one in `apps/keira/src/assets/i18n/en.json`, run:

```
npm run wiki:controls
```

The pictures follow AbyssEngine's controls export (same layout and colours, light and dark), with Keira's actions.
