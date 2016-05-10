"use strict";
var electron = require('electron'),
	path = require('path'),
	fs = require('fs'),
	Positioner = require('electron-positioner');

var BrowserWindow = electron.BrowserWindow;
var globalShortcut = electron.globalShortcut;
var Menu = electron.Menu;
var Tray = electron.Tray;
var session = require('electron').session;


// Module to control application life.
var app = electron.app;
var currentSong = {};
var mainWindow;

var services = require('./services.json');
var storage = require("./lib/storage");

var savedServiceId = storage.get("currentService");
var lastURL = storage.get("lastURL");
var showDock = storage.get("showDock");

var currentService;

if(savedServiceId){
	currentService = services.filter(function(service){
		return service.id == savedServiceId;
	})[0]
}
else{
	currentService = services[0];
}

global.sharedObject = {
	services: services,
	currentService: currentService
};

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/PepperFlash/PepperFlashPlayer.plugin'));

app.on('ready', function() {
	// Menubar icon
	var appIcon = new Tray(path.join(__dirname, 'headphones-with-music-noteTemplate.png'));

	// RPC to handle events from the page.
	electron.ipcMain.on('asynchronous-message', function(event, arg){
		if (arg.title) {
			currentSong = arg;
			appIcon.setToolTip(currentSong.title + ' by ' + currentSong.artist)
		}
	});

	var template = services.map(function(service){
		return {
			id: service.id,
			label: service.name,
			checked: (currentService.id === service.id) ? true : false,
			type: 'radio',
			click: function(e) {
				var selected = services.filter(function(service){
					return e.id == service.id;
				})[0];
				showService(selected);
			}
		}
	});
	template = template.concat(
		{
			type: 'separator'
		},
		{
			label: 'Show in Dock',
			type: 'checkbox',
			checked: showDock,
			click: function(e) {
				if(e.checked){
					app.dock.show();
				}else{
					app.dock.hide();
				}
				storage.set("showDock", e.checked);
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Debug',
			submenu: [
				{
					label: 'Reload',
					accelerator: 'Command+R',
					click: function() { mainWindow.reloadIgnoringCache(); }
				},
				{
					label: 'Toggle DevTools',
					accelerator: 'Alt+Command+I',
					click: function() { mainWindow.openDevTools({mode: 'undocked'}); }
				},
			]
		},
		{
		label: 'Quit',
		accelerator: 'Command+Q',
		click: function click() {
			app.quit();
		},
	});

	var contextMenu = Menu.buildFromTemplate(template);

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
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 600,
		webPreferences: {
			plugins: true,
			// nodeIntegration breaks jquery.  We can do everything in a preload (which still has access to node)
			nodeIntegration: false,
			//preload: path.join(__dirname, 'pandora_preload.js')
			preload: path.join(__dirname, 'preload.js')
		},
		frame: false
	});
	var positioner = new Positioner(mainWindow);
	positioner.move('topRight');

	/*
	mainWindow.loadURL('http://pandora.com/', {
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
	});*/

	if(lastURL){
		mainWindow.loadURL(lastURL);
	}else{
		mainWindow.loadURL(currentService.url);
	}

	mainWindow.on('blur', function () {
		if(!mainWindow.isDevToolsOpened()) {
			mainWindow.hide()
		}
	});

	mainWindow.webContents.on('did-navigate', function(event, url){
		storage.set("lastURL", url);
	});

	mainWindow.webContents.on('did-navigate-in-page', function(event, url){
		storage.set("lastURL", url);
	});

	// Set up media keys
	globalShortcut.register('MediaPlayPause', function () {
		mainWindow.webContents.executeJavaScript('Play();')
	});
	globalShortcut.register('MediaNextTrack', function () {
		mainWindow.webContents.executeJavaScript('Next();')
	});
	globalShortcut.register('Cmd+Ctrl+m', function() {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			mainWindow.show()
		}
	});
});

app.on('activate', function(){
	mainWindow.show();
});

app.dock.setIcon(path.join(__dirname, 'dock.png'))
app.setName('Music Menu');

if(!showDock){
	app.dock.hide();
}


function showService(service){
	global.sharedObject.currentService = service;
	storage.set("currentService", service.id);
	mainWindow.show();
	mainWindow.loadURL(service.url);
}