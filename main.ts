import * as cors from 'cors';
import { BrowserWindow, Menu, MenuItem, app, nativeImage, shell } from 'electron';
import * as settings from 'electron-settings';
import * as express from 'express';
import * as morgan from 'morgan';
import * as fetch from 'node-fetch';
import * as path from 'path';
import * as url from 'url';

/*
 * Inspired by https://github.com/Miorey/bypass-cors-policies
 * bypass cors running a web server in port 3003 making a new http request from nodejs
 * using node-fetch (as fetch) and return the response to the web application
 */
const TIMEOUT = 2000;
const PORT = 3003;
const SERVER_NAME = 'https://wow.zamimg.com';
const appRest = express();
appRest.use(morgan(`dev`));
appRest.use(express.json());
appRest.use(express.urlencoded({ extended: true }));
appRest.use(cors());

async function bypassCORS(req) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${TIMEOUT} milli-seconds`));
    }, TIMEOUT);
  });

  const response: any = await Promise.race([fetch(`${SERVER_NAME}${req.url}`), timeout]).catch(() => ({ ok: false, status: 408 }));
  if (!response.ok) {
    return response.status;
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

appRest.use(`/`, async (req, res /* , next */) => {
  const content = await bypassCORS(req);
  res.send(content);
});
appRest.listen(PORT).on('error', (err) => {
  console.log('err', err);
});

let win;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

function createWindow() {
  const hasPreviousSettings = settings.hasSync('user_settings.width');
  const width = hasPreviousSettings ? Number(settings.getSync('user_settings.width')) : 1024;
  const height = hasPreviousSettings ? Number(settings.getSync('user_settings.height')) : 768;
  const pox_x = hasPreviousSettings ? Number(settings.getSync('user_settings.pos_x')) : 0;
  const pos_y = hasPreviousSettings ? Number(settings.getSync('user_settings.pos_y')) : 0;

  // Create the browser window.
  win = new BrowserWindow({
    x: pox_x,
    y: pos_y,
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // TODO: change this once Spectron supports it
    },
    icon: nativeImage.createFromPath('src/assets/img/ac.png'),
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/browser/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  win.on('close', function (e) {
    //Save the settings
    const bounds = win.getBounds();
    settings.setSync('user_settings', {
      width: bounds.width,
      height: bounds.height,
      pos_x: bounds.x,
      pos_y: bounds.y,
    });
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // open links in the default browser
  win.webContents.on('new-window', function (event, link) {
    event.preventDefault();
    shell.openExternal(link);
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', function () {
    createWindow();

    // Navigation Top Bar
    const navMenu: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.name,
        submenu: [{ role: 'quit' }],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { type: 'separator' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { role: 'resetZoom' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
          { role: 'minimize' },
          { role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Keira3',
            submenu: [
              {
                label: 'Keira3 Repository',
                click: () => {
                  shell.openExternal('https://github.com/AzerothCore/Keira3');
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+F+1' : 'F1',
              },
              {
                label: 'Report a Bug',
                click: () => {
                  shell.openExternal('https://github.com/AzerothCore/Keira3/issues/new');
                },
              },
            ],
          },
          {
            label: 'AzerothCore',
            submenu: [
              {
                label: 'AzerothCore Repository',
                click: () => {
                  shell.openExternal('https://github.com/azerothcore/azerothcore-wotlk');
                },
              },
              {
                label: 'Report a Bug',
                click: () => {
                  shell.openExternal('https://github.com/azerothcore/azerothcore-wotlk/issues/new/choose');
                },
              },
            ],
          },
          {
            label: 'Wiki',
            click: () => {
              shell.openExternal('https://www.azerothcore.org/wiki/database-world');
            },
            accelerator: 'CmdorCtrl+H',
          },
          {
            label: 'Join our Discord',
            click: () => {
              shell.openExternal('https://discord.com/channels/217589275766685707/536630256048799744');
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(navMenu);
    Menu.setApplicationMenu(menu);

    // Right-Click Menu
    const ctxMenu = new Menu();
    ctxMenu.append(new MenuItem({ role: 'undo' }));
    ctxMenu.append(new MenuItem({ role: 'redo' }));
    ctxMenu.append(new MenuItem({ type: 'separator' }));
    ctxMenu.append(new MenuItem({ role: 'cut' }));
    ctxMenu.append(new MenuItem({ role: 'copy' }));
    ctxMenu.append(new MenuItem({ role: 'paste' }));
    ctxMenu.append(new MenuItem({ role: 'selectAll' }));
    ctxMenu.append(new MenuItem({ type: 'separator' }));
    ctxMenu.append(new MenuItem({ role: 'toggleDevTools' }));

    win.webContents.on('context-menu', function () {
      ctxMenu.popup(win);
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
