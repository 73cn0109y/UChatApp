/**
 * Created by texpe on 13/01/2017.
 */

const { ipcMain } = require('electron');
const storage = require('electron-json-storage');

ipcMain.on('get-token', (e, arg) => {
	storage.get('data', (err, data) => {
		e.sender.send('get-token', data.token);
	});
});

ipcMain.on('set-token', (e, arg) => {
	storage.set('data', { token: arg.token }, err => {
		e.sender.send('set-token', err ? null : arg || null);
	});
});