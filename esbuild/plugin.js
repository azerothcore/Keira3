/** @type {import('esbuild').Plugin} */
const plugin = {
  name: 'plugin',
  setup(build) {
    const options = build.initialOptions;
    options.external ??= [];
    options.external.push('sqlite3');
  },
};

module.exports = plugin;
