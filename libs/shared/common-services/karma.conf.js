const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
  const baseConfig = getBaseKarmaConfig(config);
  config.set({
    ...baseConfig,
    frameworks: [...baseConfig.frameworks],
    plugins: [...baseConfig.plugins],
    coverageReporter: {
      ...baseConfig.coverageReporter,
      dir: join(__dirname, '../../../coverage/libs/shared/common-services'),
    },
  });
};
