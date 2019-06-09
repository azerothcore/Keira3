# Keira3

Cross-platform desktop application featuring a **Database Editor** for the [AzerothCore MMORPG framework](http://www.azerothcore.org).

With Keira3 you don't have to know the SQL language in order to change contents: it will generate the SQL queries automatically for you. The SQL code will be displayed, so you can **learn**, and then you can **copy** or **execute** it directly to your database.

Made with ❤ and [TypeScript](http://www.typescriptlang.org/), [Electron](https://electronjs.org/), [Angular](https://angular.io/), [Bootstrap](https://getbootstrap.com/).

## Work in progress

Keira3 is currently in a WIP state. All the news and releases will be announced via [the forum](https://github.com/azerothcore/forum/issues/21).

## Support us

You can support the Keira3 development by [donating with PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=borzifrancesco%40gmail.com&item_name=Support+Keira3+Development&currency_code=EUR&source=url).

## Inspired by

We created Keira inspired by the old [indomit's Quice/Truice](https://github.com/indomit/quice) database editor, and by the [Discover-'s SAI Editor](https://github.com/Discover-/SAI-Editor). Our primary goal was to provide an editor with the same features that was cross-platform, so we built it as a web app.

Keira3 is the direct successor of [Keira2](https://github.com/Helias/Keira2). We kept the cross-platform promise as well as adding the possibility to execute the generated queries and simplifying the application setup.

## Development

### Dependencies

Install dependencies with npm :

``` bash
npm install
```

If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

### Build


To run the app in local development with hot reload:

```bash
npm start
```

More commands:

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser with hot reload (NOTE: no Electron/Node lib will work in this case) |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |
|`npm run test`|  Run unit tests once |
|`npm run test -- --watch`|  Run unit tests in watch mode |

**Note: Only /dist folder and node dependencies will be included in the executable.**
