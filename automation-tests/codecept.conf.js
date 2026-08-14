/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './tests/**/*_test.js',

  output: './output',

  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:3000',
      show: false
    }
  },

  include: {
    I: './steps_file.js'
  },

  plugins: {
    screenshot: {
      enabled: true
    }
  },

  name: 'automation-tests'
};
