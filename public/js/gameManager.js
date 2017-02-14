/**
 * Created by texpe on 14/02/2017.
 */

const io = require('socket.io-client');
let Games = {};

// Dynamically load all platforms
// Saves us from having to import them manually
(() => {
	require('fs').readdirSync(__dirname + '/games').forEach(file => {
		let module = require(__dirname + '/games/' + file);
		if(module.hasOwnProperty('getName'))
			Games[module.getName().toLowerCase()] = module;
	});
})();

class GameManager {
	constructor() {
		this.currentGame = null;
		this.client = null;
		this.broadcasterCommands = ['new', 'stop', 'restart'];

		let url = null, token = null;
		let params = window.location.search;
		params = params.substr(1, params.length - 1);

		params.split('&').forEach(value => {
			if(value.startsWith('token='))
				token = value.split('=')[1].trim();
			else if(value.startsWith('host='))
				url = value.split('=')[1].trim();
		});

		if(!url || !token)
			return console.error('URL or Token was not provided!');

		this.setupClient(url + 'gameroom?token=' + token);
	}

	setupClient(url) {
		this.client = io(url);

		this.client.on('message', data => {
			if(!data.Message) return;

			const isBroadcaster = data.isBroadcaster;
			let message = data.Message.trim().split(' ');

			if(message.length <= 0) return;

			const command = message[1].toLowerCase().trim();

			if(!isBroadcaster && this.broadcasterCommands.indexOf(command) >= 0)
				return;

			switch(command) {
				case 'new':
					if(message.length >= 3) this.newGame(message[2]);
					return;
				case 'stop':
					return this.stopGame();
				case 'restart':
					return this.restartGame();
				case 'players':
					return this.setPlayers(data.Message);
			}

			if(this.currentGame)
				this.currentGame.processInput(data);
		});
	}

	newGame(name) {
		name = name.toLowerCase();
		if(this.currentGame)
			return this.client.send(`There is currently a game of ${this.currentGame.name} in progress! Stop it first using the stop command.`);
		if(!Games.hasOwnProperty(name))
			return this.client.send(`Game '${name}' does not exist!`);

		this.currentGame = new Games[name](this.client);
		this.currentGame.new();
	}

	stopGame() {
		if(!this.currentGame)
			return this.client.send('There is no game currently in progress!');

		this.currentGame.stop();
		delete this.currentGame;
		this.currentGame = null;
	}

	restartGame() {
		if(!this.currentGame)
			return this.client.send('There is no game currently in progress!');

		this.currentGame.restart();
	}

	setPlayers(data) {
		if(!this.currentGame)
			return this.client.send('There is no game currently in progress!');

		data = data.split(' ');

		if(data.length <= 2) return this.client.send('You need to specify at least 1 player!');

		let players = data.slice(2);
		for(let i = 0; i < players.length; i++)
			players[i] = players[i].trim();
		this.currentGame.players = players;
		this.client.send(`${players.length} player${players.length === 1 ? '' : 's'} have been entered into the game ${this.currentGame.name}`);
	}
}

gameManager = new GameManager();