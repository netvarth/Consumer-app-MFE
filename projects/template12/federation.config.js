const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'template12',

  exposes: {
    './Home': './projects/template12/src/app/home/home.module.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0
  
});
