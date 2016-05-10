
var sharedObject = require('remote').getGlobal('sharedObject');
var services = sharedObject.services;
var currentService = sharedObject.currentService;


window.addEventListener('load', function() {
	var ipcRenderer = require('electron').ipcRenderer;
	window.simulateClick = function simulateClick(element) {
		if (!element) {
			return false;
		}
		var click = new MouseEvent('click', {
			bubbles: true,
			cancelable: false,
			view: window
		});
		return element.dispatchEvent(click);
	};
	window.Play = function Play() {
		playPauseButton = document.querySelector('#player-bar-play-pause');
		simulateClick(playPauseButton);
	};
	window.Next = function Next() {
		var skipButton = document.querySelector('#player-bar-forward');
		simulateClick(skipButton);
	};
	var lastTitle = '';
	setInterval(function() {

		if(document.querySelector('#currently-playing-title')){
			var title = document.querySelector('#currently-playing-title').textContent;
			var artist = document.querySelector('#player-artist').textContent;
			var album = document.querySelector('.player-album').textContent;
			var art = document.querySelector('#playerBarArt').src;
		}

		// We got a new song!
		if (title && (title != lastTitle)) {
			new Notification(title, {
				silent: true,
				body: 'by ' + artist + '\non ' + album,
				icon: art
			});
			lastTitle = title;
			ipcRenderer.send('asynchronous-message', {
				title: title,
				artist: artist,
				album: album
			});
		}
	}, 1000);
}, false);