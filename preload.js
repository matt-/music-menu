var sharedObject = require('remote').getGlobal('sharedObject');
var services = sharedObject.services;
var currentService = sharedObject.currentService;

window.currentService = currentService;

//window.addEventListener('load', function() {
window.addEventListener('DOMContentLoaded', function() {
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
		var isPlaying = document.querySelector(currentService.selectors.is_playing);
		var playButton = document.querySelector(currentService.selectors.play);
		var pauseButton = (currentService.selectors.pause) ? document.querySelector(currentService.selectors.pause): playButton;

		var playPauseButton = (isPlaying) ? pauseButton : playButton;
		playPauseButton.click();
	};
	window.Next = function Next() {
		var skipButton = document.querySelector(currentService.selectors.next);
		skipButton.click();
	};

	if(currentService.selectors.drag){
		var drag = document.querySelector(currentService.selectors.drag);
		if(drag){
			drag.style['-webkit-app-region'] = 'drag';
		}
	}

	var lastTitle = '';

	setInterval(function() {

		var title = '';
		var artist = '';
		var album = '';
		var art = '';

		var noteTitle;
		var noteBody;

		var titleSelector = document.querySelector(currentService.selectors.track.title);
		if(titleSelector){

			var title = titleSelector.textContent;
			if(currentService.selectors.track.artist){
				var artistSelector = document.querySelector(currentService.selectors.track.artist);
				artist = artistSelector ? artistSelector.textContent : '';
			}

			if(currentService.selectors.track.album){
				var albumSelector = document.querySelector(currentService.selectors.track.album);
				album = albumSelector ? albumSelector.textContent : '';
			}

			if(currentService.selectors.track.art){
				var artSelector = document.querySelector(currentService.selectors.track.art);
				if(artSelector){
					if(artSelector.nodeName === "IMG"){
						art = artSelector.src;
					}else{
						var url = artSelector.style.backgroundImage;
						// TODO switch this to a regex to support with and without quotes.
						art = url.substring(5, url.length-2);
					}
				}

			}

			if(!artist && !album){
				noteBody = title;
				noteTitle = currentService.name + ': ';
			}else{
				noteBody = 'by ' + artist + '\non ' + album;
				noteTitle = title;
			}

			// We got a new song!
			if (title && (title != lastTitle)) {
				new Notification(noteTitle, {
					silent: true,
					body: noteBody,
					icon: art
				});
				lastTitle = title;
				ipcRenderer.send('asynchronous-message', {
					title: title,
					artist: artist,
					album: album
				});
			}

		}
	}, 1000);
}, false);