const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const Config = require('electron-config');
const config = new Config();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window, popup;

function createWindow() {
	let opts = {
		width: 1024,
		height: 768,
		title: 'UChat',
		frame: false,
		minWidth: 600,
		minHeight: 300
	};

	Object.assign(opts, config.get('winBounds'));

	// Create the browser window.
	window = new BrowserWindow(opts);

	// and load the index.html of the app.
	window.loadURL(url.format({
		pathname: path.join(__dirname, 'public', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	//window.webContents.openDevTools();

	window.on('close', () => {
		config.set('winBounds', window.getBounds());
	});

	// Emitted when the window is closed.
	window.on('closed', function() {
		app.quit();
	});
}

app.disableHardwareAcceleration();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function() {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if(window === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./ipc');