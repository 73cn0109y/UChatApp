/**
 * Created by texpe on 14/02/2017.
 */

const EventEmitter = require('events').EventEmitter;

class CoreGame extends EventEmitter {
	constructor(client, args) {
		super();

		this.client = client;
		this.args = args;

		this.name = 'Unknown_Game';
		this.state = 'stopped';
		this.drawRate = 30; // 30 fps

		this.players = [];
		this.minPlayers = 1;
		this.maxPlayers = 1;
		this.playerTurn = 0;

		// Timers
		this.timers = {};

		// Canvas
		this.canvasElement = document.getElementById('gameCanvas');
		this.canvas = {
			context: this.canvasElement.getContext('2d'),
			size: {
				width: this.canvasElement.width,
				height: this.canvasElement.height
			},
			backColor: 'transparent',
			strokeStyle: 'rgb(0,0,0)',
			backImage: null,
			lineWidth: 1,
			font: '48px serif'
		};
	}

	outputMessage(message) {
		if(this.client) this.client.send(message);
	}

	new(restart = false) {
		this.outputMessage(`Starting new ${this.name} game...`);
		if(!restart) this.players = [];
		setGameStatus('Waiting for players');

		this.state = 'playing';

		this.update();
	}

	stop() {
		this.outputMessage(`Stopping ${this.name} game...`);
		setGameStatus('No game is currently running');
		this.state = 'stopped';
		this.emit('finished', null);

		this.clearTimers();

		//this.canvas.context.clearRect(0, 0, this.canvas.size.width, this.canvas.size.height);
	}

	restart() {
		this.clearTimers();

		this.outputMessage(`Restarting ${this.name} game...`);
		setGameStatus('Restarting current game');
		this.players = [];
		this.state = 'restarting';
		this.new(true);
	}

	// Main logic loop
	update() {
		if(this.state !== 'playing') return;

		this.draw();

		// Update every 30 seconds
		this.timers.update = setTimeout(() => {
			this.update();
		}, 1000 / this.drawRate);
	}

	// (Re)Draw the canvas
	// Should be handled by the individual game
	draw() {
		this.canvas.context.fillStyle = this.canvas.backColor;
		this.canvas.context.clearRect(0, 0, this.canvas.size.width, this.canvas.size.height);
		this.canvas.context.fillRect(0, 0, this.canvas.size.width, this.canvas.size.height);
		this.canvas.context.lineWidth = this.canvas.lineWidth;
		this.canvas.context.strokeStyle = this.canvas.strokeStyle;
		this.canvas.context.font = this.canvas.font;

		if(this.canvas.backImage)
			this.canvas.context.drawImage(this.canvas.backImage, 0, 0, this.canvas.size.width, this.canvas.size.height);
	}

	// returning null is presumed to be a succesful parse
	processInput(data) {
		if(this.players.length < this.minPlayers) {
			this.outputMessage(`You need to add at least ${this.minPlayers} player${this.minPlayers === 1 ? '' : 's'} to the game!`);
			return false;
		}

		let isPlayer = false;

		if(!data.Sender && !data.isBroadcaster) return;
		if(data.Sender && data.Sender.toLowerCase() === this.players[this.playerTurn].toLowerCase())
			isPlayer = true;
		if(data.isBroadcaster && this.players[this.playerTurn].toLowerCase() === '$broadcaster')
			isPlayer = true;

		return isPlayer;
	}

	setImage(url) {
		let img = new Image();
		img.src = url;
		img.width = this.canvas.size.width;
		img.height = this.canvas.size.height;

		this.canvas.backImage = img;
	}

	endPlayerTurn() {
		this.playerTurn++;
		if(this.playerTurn >= this.players.length)
			this.playerTurn = 0;

		let player = this.players[this.playerTurn];
		if(player === '$broadcaster') player = 'The Broadcaster';

		setGameStatus(`${player}'s turn`, this.playerColors[this.playerTurn]);
	}

	clearTimers() {
		for(let timer in this.timers) {
			clearTimeout(this.timers[timer]);
			delete this.timers[timer];
		}
	}
}

module.exports = CoreGame;