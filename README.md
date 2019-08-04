# Keira3

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e9d97b0240fd452487bfd5d3e55da96f)](https://app.codacy.com/app/FrancescoBorzi/Keira3?utm_source=github.com&utm_medium=referral&utm_content=azerothcore/Keira3&utm_campaign=Badge_Grade_Dashboard)
[![Build Status](https://travis-ci.com/azerothcore/Keira3.svg?branch=master)](https://travis-ci.com/azerothcore/Keira3)
[![Coverage Status](https://coveralls.io/repos/github/azerothcore/Keira3/badge.svg)](https://coveralls.io/github/azerothcore/Keira3)
[![dependencies Status](https://david-dm.org/azerothcore/Keira3/status.svg)](https://david-dm.org/azerothcore/Keira3/)
[![devDependencies Status](https://david-dm.org/francescoborzi/ngx-duration-picker/dev-status.svg)](https://david-dm.org/francescoborzi/ngx-duration-picker?type=dev)
<a href="https://www.paypal.me/francesco92dev" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
[![Discord](https://img.shields.io/discord/217589275766685707.svg)](https://discordapp.com/channels/217589275766685707/536630256048799744)

![Keira3](https://user-images.githubusercontent.com/75517/59927799-8eba4a00-943d-11e9-876e-06f4b08e01a2.png)


Cross-platform desktop application featuring a **Database Editor** for the [AzerothCore MMORPG framework](http://www.azerothcore.org).

With Keira3 you don't have to know the SQL language in order to change contents: it will generate the SQL queries automatically for you. The SQL code will be displayed, so you can **learn**, and then you can **copy** or **execute** it directly to your database.

Made with ❤ and [TypeScript](http://www.typescriptlang.org/), [Electron](https://electronjs.org/), [Angular](https://angular.io/), [Bootstrap](https://getbootstrap.com/).

## Work in progress

Keira3 is currently in a WIP state. All the news and releases will be announced via [the forum](https://github.com/azerothcore/forum/issues/21).

## Support us

You can support the Keira3 development by [donating with PayPal](https://www.paypal.me/francesco92dev).

## Inspired by

We created Keira inspired by the old [indomit's Quice/Truice](https://github.com/indomit/quice) database editor, and by the [Discover-'s SAI Editor](https://github.com/jasperrietrae/SAI-Editor). Our primary goal was to provide an editor with the same features that was cross-platform, so we built it as a web app.

Keira3 is the direct successor of [Keira2](https://github.com/Helias/Keira2). We kept the cross-platform promise as well as adding the possibility to execute the generated queries and simplifying the application setup.

## AzerothCore Database

In order to use Keira3 you have to connect to an instance of the [AzerothCore](https://github.com/azerothcore/azerothcore-wotlk) Database.

If you don't have any, you can easily create one following [this guide](http://www.azerothcore.org/wiki/database-only-quick-setup).

## Development

### Dependencies

You need to first install [node](https://nodejs.org) in order to have `npm` available in your system.

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
|`npm run test-ci`|  Run unit tests once |
|`npm run test`|  Run unit tests in watch mode |

**Note: Only /dist folder and node dependencies will be included in the executable.**
