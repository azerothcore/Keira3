# World editor internals

How the 3D world editor (**World Editor** in Keira3's menu) is put together, for anyone changing it. The user side is in
[World editor controls](World-Editor-Controls.md).

## Libraries

The editor follows the repo's Nx layout (`app-keira → main-window → features → shared`):

| Library | Path | What it holds |
|---|---|---|
| `keira-shared-wow-data` | `libs/shared/wow-data` | Reading the game: MPQ archives (StormLib in WebAssembly), DBC tables, ADT terrain, WMO buildings, M2 models, minimaps, Light.dbc, the server's maps / vmaps / mmaps, the disk cache, the performance log |
| `keira-shared-world-viewer` | `libs/shared/world-viewer` | The 3D view (three.js): terrain streaming, buildings, doodads, spawn models, markers, paths, gizmo, navmesh, sky and lighting, weather, compass, 2D world map, render and controls settings, gamepad |
| `keira-features-world-editor` | `libs/features/world-editor` | The editor around the view: map / zone pickers, panels (View, Filters, Controls, Settings, Scan), spawns and waypoints from the database, pending changes, undo, SQL |

The view knows nothing of the database: the editor gives it plain objects (`WorldSpawn`, `WaypointPath`, `WorldMarker`,
...) as inputs and listens to its outputs (`picked`, `objectMoved`, `centerChanged`, `zoneChanged`, ...).

## Game data

`WowClientService` (wow-data) opens the client folder set in Settings (`WTF/Config.wtf` picks the locale), mounts
`Data/` into StormLib's file system and opens every MPQ in the game's patch order (`mpq-order.ts`); an unpacked folder
in `Data/` is read like an archive (`FolderArchive`). Files are read from the newest archive that has them.

Heavy parsing runs in a web worker (`wow-parser.worker.ts`, jobs in `parse-jobs.ts`), so the window keeps drawing while a
tile loads. Results come back as transferable typed arrays.

What the server sees (its `maps/`, `vmaps/`, `mmaps/` and `dbc/` from the extractors) is read from the server data
folder, when set: collision for line of sight and snapping, liquids and areas per chunk (`server-map.ts`), navigation
meshes for paths (`navmesh.ts`, `navmesh-path.ts`).

Everything parsed can be kept in the disk cache (`WowDataCacheService`, its own folder, a size limit, per client
identity), so a place loads much faster the second time. The memory caches of the service are emptied when the RAM limit
of the View panel is reached (`trimMemory()`).

### Coordinates

Server coordinates are used everywhere outside the renderer: X north, Y west, Z up, in yards; a map is 64 × 64 tiles of
533⅓ yards, tile (32, 32) at the origin. The scene uses three.js axes: scene x = server −Y, scene y = server Z,
scene z = server −X (see `coords.ts`). Recast navigation meshes have their own axes (x = server Y, y = height,
z = server X). Light.dbc stores positions in its own space divided by 36.

## The view

`WorldViewerComponent` owns a `WorldScene` (scene, camera, lights, fog, markers, picking) and a renderer, and draws only
when something changed (`requestRender`), except while the skybox turns or weather falls.

- **Terrain**: `TerrainStreamer` loads the tiles around the camera target (radius from the View panel), detailed with
  the real textures (`terrain-material.ts`, a shader blending up to four layers with the zone's sun and ambient light,
  saturated at 1 like the client) or low-poly with minimap colours. `WorldPrefetch` reads the next tiles ahead.
- **Buildings**: `WorldObjects` places each tile's WMOs; roofs are on their own layer, indoor groups (MOGP flag 0x2000)
  can be hidden (from outside they show as flat squares), a map made of one building always shows them.
- **Doodads**: `WorldDoodads`, by distance: large and small, trees and other props apart.
- **Spawns**: markers for every creature and gameobject, and their real models near the camera (`SpawnModels`), with
  facing arrows, wander circles and bounds on request.
- **Lighting**: `ZoneLighting` samples Light.dbc where the camera looks at the time of day (bands of 18 colours and 6
  floats, half-minutes), blending local lights by falloff over the map's default light; brightness per part of the day.
  `WorldSkybox` draws the zone's (or a chosen) skybox model.
- **Weather**: `WeatherEffect`, a field of streaks (rain) or points (snow, sandstorm) wrapped around the camera.
- **Memory**: every 2 seconds the RAM (process RSS) and the GPU memory of the scene are checked against the limits of
  the View panel; over a limit, caches are trimmed, textures released and prefetching stops.

Picking goes through `WorldScene.pick` (markers first, then models, then the ground), hovering is throttled to a frame.

## The editor

`WorldEditorComponent` holds the editor's state in signals; what must survive leaving the tab (pending changes, undo,
selection, panels, tool, picker sort) is in `WorldEditorSessionService`. `WorldEditorService` runs the SQL through
Keira's `MysqlQueryService`: spawns around the camera, waypoints (`waypoint_data` and SmartAI paths), formations, pools,
events, quests, teleports, game_weather.

Edits are kept as pending changes (`WorldEditorChanges`) until saved: moving, turning, adding or deleting spawns and
waypoints, with undo / redo (100 steps) and the SQL shown before it runs.

Filters (`spawn-filters.ts`): game events, helper triggers, the camera's phase mask, a search; the spawns they let
through are the only ones drawn, with the paths they walk.

## Controls

`world-controls-settings.ts` defines every action, its group and default bindings, in the ArmA way: any number of
inputs per action, any input on several actions. An input is a `KeyboardEvent.code` with modifiers (`Ctrl+KeyZ`), a
mouse button or wheel step, a gamepad button or stick direction (`PadA`, `PadLeftStickUp`), or a double tap (`2x KeyK`).
`pressedInputs` reads an event once (so every listener agrees on double taps); `inputConflict` tells clashes.
`GamepadInputService` polls the gamepads only while the world editor listens. The wiki pictures are drawn from these
defaults by `npm run wiki:controls`.

## Settings saved on this computer

| Key (localStorage) | What |
|---|---|
| `keira3.worldEditor.paths` | Client, server data and source folders |
| `keira3.worldEditor.cache` | Disk cache: on / off, folder, size limit |
| `keira3.worldEditor.render` | Everything in the View panel |
| `keira3.worldEditor.controls` | Bindings, keyboard navigation, camera speed |
| `keira3.worldEditor.filters` | The Filters panel |
| `keira3.worldEditor.lastView` | The map and place last looked at |
| `keira3.worldEditor.mapQuality` | The 2D world map's quality |
| `keira3.worldEditor.pickerSort` | The sort the map and zone pickers start with |
| `keira3.worldEditor.confirmDelete` | Ask before deleting |

Each is read with a fallback for every field, so a new setting never breaks an old save.

## Performance log

**View › Write a performance log** writes, in the cache folder, a file named
`dd_mm_yyyy_<commit>_<keira version>_hh_mm_ss.log`: the settings and camera, every task that held the window 50 ms or
more with the measured work inside it, anything measured over 30 ms, and every 2 seconds the frames and where the time
went. Code is measured with `perfTime(label, fn)` and `perfNote(text)` from `perf-log.ts`, cheap while the log is off.

## Tests

100% coverage is enforced (`nx test <project> --coverage`). The view is tested with a fake renderer and the game data
with mocks (`wow-native-api.mock.ts`, `dbc.mock.ts`, `server-data.mock.ts`); the editor's spec uses a fake view
component, driven through its inputs and outputs, and the page object model.
