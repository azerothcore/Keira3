module.exports = (config) => {
  return {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-coverage'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-time-stats-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: true,
        failFast: true,
        timeoutInterval: 10000,
      },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      subdir: '.',
      fixWebpackSourcePaths: true,
      reporters: [
        { type: 'text-summary', file: 'coverage.txt' },
        { type: 'html', file: 'coverage.txt' },
        { type: 'lcovonly', subdir: './', file: 'coverage.txt' },
      ],
      check: {
        global: {
          statements: 100,
          lines: 100,
          branches: 100,
          functions: 100,
        },
      },
    },
    reporters: ['progress', 'kjhtml', 'time-stats'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: ['--headless', '--remote-debugging-port=9222', '--no-sandbox'],
      },
    },
    singleRun: true,
    restartOnFileChange: true,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,
    browserDisconnectTimeout: 30000,
    browserDisconnectTolerance: 10,
  };
};
