/**
 * Created by texpe on 14/02/2017.
 */

class CoreGame {
	constructor(client, args) {
		this.client = client;
		this.args = args;
		
		this.name = 'Unknown_Game';
		this.state = 'stopped';
		this.players = [];
		this.drawRate = 30; // 30 fps

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

		this.canvas.context.clearRect(0, 0, this.canvas.size.width, this.canvas.size.height);
	}

	restart() {
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
		setTimeout(() => {
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
		console.error(`${this.name} is not processing input!`);
		return null;
	}

	setImage(url) {
		let img = new Image();
		img.src = url;
		img.width = this.canvas.size.width;
		img.height = this.canvas.size.height;

		this.canvas.backImage = img;
	}
}

module.exports = CoreGame;