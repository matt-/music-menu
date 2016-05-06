"use strict";
var electron = require('electron'),
	path = require('path'),
	Positioner = require('electron-positioner');

var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var Menu = electron.Menu;
var Tray = electron.Tray;

// Module to control application life.
var app = electron.app;
var currentSong = {};

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/PepperFlash/PepperFlashPlayer.plugin'));

app.on('ready', function() {
	// Menubar icon
	var appIcon = new Tray(path.join(__dirname, 'headphones-with-music-note.png'));

	// RPC to handle events from the page.
	electron.ipcMain.on('asynchronous-message', function(event, arg){
		if (arg.title) {
			currentSong = arg
			appIcon.setToolTip(currentSong.title + ' by ' + currentSong.artist)
		}
	});

	// Menu bar right click menu
	var contextMenu = Menu.buildFromTemplate([{
		label: 'Quit',
		accelerator: 'Command+Q',
		click: function click() {
			app.quit();
		}
	}]);
	// Menu bar actions
	appIcon.on('right-click', function () {
		appIcon.popUpContextMenu(contextMenu);
	});

	appIcon.on('click', function () {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			mainWindow.show()
		}
	});

	// Create the browser window.
	var mainWindow = new BrowserWindow({
		width: 1000,
		height: 600,
		webPreferences: {
			plugins: true,
			// nodeIntegration breaks jquery.  We can do everything in a preload (which still has access to node)
			nodeIntegration: false,
			preload: path.join(__dirname, 'pandora_preload.js')
		},
		frame: false
	});
	var positioner = new Positioner(mainWindow);
	positioner.move('topRight');

	mainWindow.loadURL('http://pandora.com/', {
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
	});

	mainWindow.on('blur', function () {
		mainWindow.hide()
	})

	// Set up media keys
	globalShortcut.register('MediaPlayPause', function () {
		mainWindow.webContents.executeJavaScript('Play();')
	})
	globalShortcut.register('MediaNextTrack', function () {
		mainWindow.webContents.executeJavaScript('Next();')
	})

})