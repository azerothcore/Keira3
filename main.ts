import { app, BrowserWindow, shell, screen, Menu, MenuItem } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: 'src/assets/img/ac.png',
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  win.on('close', function (e) {
    if (!process.env.RUNNING_IN_SPECTRON) {
      const choice = require('electron').dialog.showMessageBoxSync(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
        });
      if (choice === 1) {
        e.preventDefault();
      }
    }
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
        submenu: [
          { role: 'quit' },
        ]
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
          { role: 'selectAll' }
        ]
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
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Keira3',
            submenu: [
              {
                label: 'Keira3 Repository',
                click: function () {
                  shell.openExternal('https://github.com/AzerothCore/Keira3/');
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+F+1' : 'F1',
              },
              {
                label: 'Report a Bug',
                click: function () {
                  shell.openExternal('https://github.com/AzerothCore/Keira3/issues/new');
                }
              },
            ]
          },
          {
            label: 'AzerothCore',
            submenu: [
              {
                label: 'AzerothCore Repository',
                click: () => {
                  shell.openExternal('https://github.com/AzerothCore/AzerothCore/');
                }
              },
              {
                label: 'Report a Bug',
                click: () => {
                  shell.openExternal('https://github.com/AzerothCore/AzerothCore/issues/new');
                }
              },
            ]
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
          }
        ]
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
