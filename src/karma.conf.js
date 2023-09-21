// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
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
          // TODO: fix the coverage bug and set them 100% again
          statements: 100,
          lines: 100,
          branches: 100,
          functions: 96,
        },
      },
    },
    reporters: ['progress', 'kjhtml', 'time-stats'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    customLaunchers: {
      "ChromeHeadless": {
        base: 'Chrome',
        flags: ['--headless', '--remote-debugging-port=9222', '--no-sandbox']
      }
    },
    singleRun: false,
    restartOnFileChange: true,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,
    browserDisconnectTimeout: 30000,
    browserDisconnectTolerance: 10,
  });
};
