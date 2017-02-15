/**
 * Created by texpe on 16/02/2017.
 */

const CoreGame = require('./core_game');

class ConnectFour extends CoreGame {
	constructor(client, args) {
		super(client, args);

		this.name = 'Connect Four';
		this.drawRate = '5';

		this.tiles = [];
		this.playerColors = ['rgb(50, 50, 200)', 'rgb(200, 50, 50)'];
		this.gridSize = 10;
		this.playerTurn = 0;
		this.drawAfterWon = false;
		this.backgroundImage = this.createImage('imgs/games/connectfour/background_tile.png');

		let gridSize = parseInt(args[0]);
		if(!isNaN(gridSize)) {
			if(gridSize < 10) gridSize = 10;
			if(gridSize > 15) gridSize = 15;
			this.gridSize = gridSize;
		}
	}

	new() {
		if(this.gridSize < 10) this.gridSize = 10;
		if(this.gridSize > 15) this.gridSize = 15;

		for(let i = 0; i < Math.pow(this.gridSize, 2); i++)
			this.tiles[i] = Math.floor(Math.random() * 2);

		this.playerTurn = 0;
		this.canvas.font = (20 + ((5 - this.gridSize) * 4)) + 'px serif';

		super.new();
	}

	processInput(data) {

	}

	update() {

		super.update();
	}

	draw() {
		super.draw();

		const width = (this.canvas.size.width / this.gridSize);
		const height = (this.canvas.size.height / this.gridSize);
		const size = Math.min(this.canvas.size.width / this.gridSize, this.canvas.size.height / this.gridSize);
		const originX = (width > height ? (this.canvas.size.width / 2 - ((size * this.gridSize) / 2)) : 0);
		const originY = (width < height ? (this.canvas.size.height / 2 - ((size * this.gridSize) / 2)) : 0);

		this.drawGrid(originX, originY, size);

		for(let i = 0; i < this.tiles.length; i++) {
			let x = originX + (size * Math.floor(i % this.gridSize)) + (size / 2);
			let y = originY + (size * Math.floor(i / this.gridSize)) + (size / 2);

			if(this.tiles[i] !== 0)
				this.drawEllipse(x, y, size, 'rgb(255,0,0)');
		}
	}

	drawGrid(originX, originY, size) {
		this.canvas.context.fillStyle = 'rgb(50, 150, 255)';
		this.canvas.context.fillRect(originX, originY, this.canvas.size.width - (originX * 2), this.canvas.size.height - (originY * 2));

		for(let y = 0; y < this.gridSize; y++) {
			const dy = Math.floor(((y + 1) * size) - (size / 2));
			for(let x = 0; x < this.gridSize; x++) {
				const dx = originX + Math.floor(((x + 1) * size) - (size / 2));
				this.drawEllipse(dx, dy, size);
			}
		}
	}

	drawEllipse(x, y, size, color = 'rgb(30,30,30)') {
		this.canvas.context.beginPath();
		this.canvas.context.ellipse(x, y, size / 2, size / 2, 0, 0, Math.PI * 2);
		this.canvas.context.closePath();
		this.canvas.context.fillStyle = color;
		this.canvas.context.fill();
	}

	createImage(url) {
		let image = new Image();
		image.src = url;
		return image;
	}

	static getName() {
		return 'connectfour';
	}
}

module.exports = ConnectFour;