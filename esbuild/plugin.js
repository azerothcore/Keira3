/** @type {import('esbuild').Plugin} */
const plugin = {
  name: 'plugin',
  setup(build) {
    const options = build.initialOptions;
    options.external ??= [];
    options.external.push('sqlite3');
    // @wowserhq/io (WoW file parsing, used by the 3D world editor) requires 'fs' only under Node/Electron.
    options.external.push('fs');
  },
};

module.exports = plugin;
