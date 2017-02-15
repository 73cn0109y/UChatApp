/**
 * Created by texpe on 16/02/2017.
 */

const CoreGame = require('./core_game');

class ConnectFour extends CoreGame {
	constructor(client, args) {
		super(client, args);

		this.name = 'Connect Four';
		this.drawRate = '5';
		this.canvas.strokeStyle = 'rgb(200, 200, 200)';

		this.tiles = [];
		this.playerColors = ['rgb(50, 50, 200)', 'rgb(200, 50, 50)'];
		this.gridSize = 10;
		this.playerTurn = 0;
		this.drawAfterWon = false;

		this.minPlayers = this.maxPlayers = 2;

		// Is set to the tile that is to be "animated"
		// We won't accept user input until this has changed back to null
		this.dropToken = null;

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
			this.tiles[i] = -1;

		this.playerTurn = 0;
		this.canvas.font = (10 + ((15 - this.gridSize) * 1.5)) + 'px serif';

		super.new();
	}

	processInput(data) {
		if(this.dropToken !== null) return;
		if(!super.processInput(data)) return;

		let message = data.Message.split(' ');

		if(message.length < 2) return this.outputMessage('Please specify what column you want to use!');

		const col = parseInt(message[1]);
		if(isNaN(col)) return this.outputMessage('Please enter a valid column number!');

		let columnFull = true;
		for(let i = 0; i < this.gridSize; i++) {
			if(this.tiles[(col - 1) + (this.gridSize * i)] < 0) {
				columnFull = false;
				break;
			}
		}

		if(columnFull) return this.outputMessage('That column is full!');

		// Set the tile and dropToken
		this.tiles[col - 1] = this.playerTurn;
		this.dropToken = col - 1;
	}

	update() {
		if(this.dropToken !== null) {
			if(this.dropToken + this.gridSize < this.tiles.length && this.tiles[this.dropToken + this.gridSize] < 0) {
				const playerId = this.tiles[this.dropToken];
				this.tiles[this.dropToken] = -1;
				this.dropToken += this.gridSize;
				this.tiles[this.dropToken] = playerId;
			}
			else {
				this.dropToken = null;
				super.endPlayerTurn();
			}
		} else {
			let winner = this.checkWinner();
			if(winner >= 0) {
				if(this.drawAfterWon) {
					this.stop();
					let winnerName = this.players[winner];
					if(winnerName === '$broadcaster') winnerName = 'The Broadcaster';
					this.outputMessage(`${winnerName} has won!`);
					setGameStatus(`${winnerName} has won!`, this.playerColors[winner]);
					return;
				}
				else this.drawAfterWon = true;
			} else if(winner <= -99) {
				if(this.drawAfterWon) {
					this.stop();
					this.outputMessage(`This game was a tie!`);
					setGameStatus(`This game was a tie!`);
					return;
				}
				else this.drawAfterWon = true;
			}
		}

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

		for(let i = 0; i < this.gridSize; i++) {
			if(this.tiles[i] >= 0) continue;

			let x = originX + (size * Math.floor(i % this.gridSize)) + (size / 4);
			let y = originY + (size * Math.floor(i / this.gridSize)) + ((size / 4) * 3);

			this.canvas.context.fillStyle = 'rgb(230,230,230)';
			this.canvas.context.fillText((i + 1).toString(), x, y);
			this.canvas.context.fillStyle = this.canvas.fillStyle;
		}

		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] < 0) continue;

			let x = originX + (size * Math.floor(i % this.gridSize)) + (size / 2);
			let y = originY + (size * Math.floor(i / this.gridSize)) + (size / 2);

			this.drawEllipse(x, y, size, this.playerColors[this.tiles[i]]);
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
		this.canvas.context.fillStyle = color;
		this.canvas.context.beginPath();
		this.canvas.context.ellipse(x, y, size / 2, size / 2, 0, 0, Math.PI * 2);
		this.canvas.context.closePath();
		this.canvas.context.fill();
	}

	checkWinner() {
		// Rows
		for(let y = 0; y < this.gridSize; y++) {
			for(let x = 1; x < this.gridSize - 3; x++) {
				const first = this.tiles[y * this.gridSize];
				if(first < 0) continue;
				if(this.tiles[y * this.gridSize + x] === first &&
					this.tiles[y * this.gridSize + (x + 1)] === first &&
					this.tiles[y * this.gridSize + (x + 2)] === first) {
					return first;
				}
			}
		}

		// Cols
		for(let x = 0; x < this.gridSize - 3; x++) {
			for(let y = 1; y < this.gridSize; y++) {
				const first = this.tiles[x * this.gridSize];
				if(first < 0) continue;
				if(this.tiles[(x * this.gridSize) + (y * this.gridSize)] === first &&
					this.tiles[x * this.gridSize + ((y + 1) * this.gridSize)] === first &&
					this.tiles[x * this.gridSize + ((y + 2) * this.gridSize)] === first)
					return first;
			}
		}

		// Left -> Right
		for(let x = 3; x < this.gridSize; x++) {
			for(let y = 3; y < this.gridSize; y++) {
				const first = this.tiles[x * this.gridSize + y];
				if(first < 0) continue;
				if(this.tiles[(x - 1) * this.gridSize + (y - 1)] === first &&
					this.tiles[(x - 2) * this.gridSize + (y - 2)] === first &&
					this.tiles[(x - 3) * this.gridSize + (y - 3)] === first) {
					return first;
				}
			}
		}

		// Right -> Left
		for(let x = 3; x < this.gridSize; x++) {
			for(let y = 0; y < this.gridSize - 3; y++) {
				const first = this.tiles[x * this.gridSize + y];
				if(first < 0) continue;
				if(this.tiles[(x - 1) * this.gridSize + (y + 1)] === first &&
					this.tiles[(x - 2) * this.gridSize + (y + 2)] === first &&
					this.tiles[(x - 3) * this.gridSize + (y + 3)] === first) {
					return first;
				}
			}
		}

		// Test for tie
		// Just checks if all tiles aren't 0
		let tieTest = true;
		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] === -1) {
				tieTest = false;
				break;
			}
		}

		return (tieTest ? -99 : -1);
	}

	static getName() {
		return 'connectfour';
	}
}

module.exports = ConnectFour;