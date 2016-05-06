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
		var isPlaying = document.querySelector('div.playButton').style.display !== 'block';
		var playPauseButton = null;
		if (isPlaying) {
			playPauseButton = document.querySelector('div.pauseButton > a');
		} else {
			playPauseButton = document.querySelector('div.playButton > a');
		}
		simulateClick(playPauseButton);
	};
	window.Next = function Next() {
		var skipButton = document.querySelector('div.skipButton > a');
		simulateClick(skipButton);
	};
	var lastTitle = '';
	setInterval(function() {
		var title = document.querySelector('.playerBarSong').textContent;
		var artist = document.querySelector('.playerBarArtist').textContent;
		var album = document.querySelector('.playerBarAlbum').textContent;
		var art = document.querySelector('.playerBarArt').src;
		// We got a new song!
		if (title != lastTitle) {
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