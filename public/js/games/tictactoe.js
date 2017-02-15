/**
 * Created by texpe on 14/02/2017.
 */

const CoreGame = require('./core_game');

class TicTacToe extends CoreGame {
	constructor(client, args) {
		super(client, args);

		this.name = 'TicTacToe';
		this.drawRate = 5; // It's TicTacToe not fucking Battlefield
		this.canvas.lineWidth = 5;
		this.canvas.strokeStyle = 'rgb(200, 200, 200)';

		this.tiles = [];
		this.playerColors = ['rgb(50, 50, 200)', 'rgb(200, 50, 50)'];
		this.gridSize = 3;
		this.drawAfterWon = false;

		this.minPlayers = this.maxPlayers = 2;

		let gridSize = parseInt(args[0]);
		if(!isNaN(gridSize)) {
			if(gridSize < 3) gridSize = 3;
			if(gridSize > 5) gridSize = 5;
			this.gridSize = gridSize;
		}
	}

	new() {
		if(this.gridSize < 3) this.gridSize = 3;
		if(this.gridSize > 6) this.gridSize = 5;

		for(let i = 0; i < Math.pow(this.gridSize, 2); i++)
			this.tiles[i] = -1;

		this.playerTurn = 0;
		this.canvas.font = (20 + ((5 - this.gridSize) * 4)) + 'px serif';

		super.new();
	}

	processInput(data) {
		if(!super.processInput(data)) return;

		let message = data.Message.split(' ');

		if(message.length < 2) return this.outputMessage('Please specify what square you want to take!');

		const square = parseInt(message[1]);
		if(isNaN(square)) return this.outputMessage('Please enter a valid number!');

		if(this.tiles[square - 1] >= 0)
			return this.outputMessage('That tile has already been taken!');

		this.tiles[square - 1] = this.playerTurn;
		super.endPlayerTurn();
	}

	update() {
		let winner = this.checkWinner();
		if(winner > 0) {
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
		super.update();
	}

	// Override CoreGame.draw()
	// but still call it
	draw() {
		super.draw();

		const tileSize = {
			width: this.canvas.size.width / this.gridSize,
			height: this.canvas.size.height / this.gridSize
		};

		this.drawGrid(tileSize);

		this.canvas.context.fillStyle = 'rgb(30,30,30)';
		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] < 0) continue; // Not occupied

			const row = Math.floor(i / this.gridSize);
			const col = Math.floor(i % this.gridSize);

			if(this.tiles[i] === 0) // Player 1 (X)
				this.drawX(col, row, tileSize);
			else if(this.tiles[i] === 1) // Player 2 (O)
				this.drawO(col, row, tileSize);
		}
	}

	drawGrid(tileSize) {
		this.canvas.context.fillStyle = 'rgb(230,230,230)';

		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] >= 0) continue;

			let x = (tileSize.width * Math.floor(i % this.gridSize));
			let y = (tileSize.height * Math.floor(i / this.gridSize));

			x += (tileSize.width / 8) * 3;
			y += (tileSize.height / 8) * 5;

			this.canvas.context.fillText((i + 1).toString(), x, y);
		}

		this.canvas.context.fillStyle = this.canvas.fillStyle;
		this.canvas.context.lineWidth = 1;
		this.canvas.context.beginPath();

		for(let i = 0; i < this.gridSize - 1; i++) {
			let x = tileSize.width * i;
			let y = tileSize.height * i;

			// Vertical
			this.canvas.context.moveTo(x + tileSize.width, 0);
			this.canvas.context.lineTo(x + tileSize.width, y + this.canvas.size.height);

			// Horizontal
			this.canvas.context.moveTo(0, y + tileSize.height);
			this.canvas.context.lineTo(x + this.canvas.size.width, y + tileSize.height);
		}

		this.canvas.context.closePath();
		this.canvas.context.stroke();
		this.canvas.context.lineWidth = this.canvas.lineWidth;
	}

	drawX(row, col, tileSize) {
		let x = tileSize.width * row;
		let y = tileSize.height * col;
		let size = [(tileSize.width / 8) * 3, (tileSize.height / 4) * 2];

		x += (tileSize.width / 8) * 2.5;
		y += tileSize.height / 4;

		this.canvas.context.strokeStyle = this.playerColors[0];
		this.canvas.context.beginPath();
		this.canvas.context.moveTo(x, y);
		this.canvas.context.lineTo(x + size[0], y + size[1]);
		this.canvas.context.moveTo(x + size[0], y);
		this.canvas.context.lineTo(x, y + size[1]);
		this.canvas.context.closePath();

		this.canvas.context.stroke();
		this.canvas.context.strokeStyle = this.canvas.strokeStyle;
	}

	drawO(row, col, tileSize) {
		let x = tileSize.width * row;
		let y = tileSize.height * col;

		x += tileSize.width / 2;
		y += tileSize.height / 2;

		this.canvas.context.strokeStyle = this.playerColors[1];
		this.canvas.context.beginPath();
		this.canvas.context.arc(x, y, 30 - ((this.gridSize - 3) * 7), 0, 2 * Math.PI);
		this.canvas.context.closePath();

		this.canvas.context.stroke();
		this.canvas.context.strokeStyle = this.canvas.strokeStyle;
	}

	checkWinner() {
		// Rows
		for(let y = 0; y < this.gridSize; y++) {
			const first = this.tiles[y * this.gridSize];
			let rowMatch = true;
			for(let x = 1; x < this.gridSize; x++) {
				if(this.tiles[y * this.gridSize + x] !== first) {
					rowMatch = false;
					break;
				}
			}
			if(rowMatch) return first;
		}

		// Cols
		for(let x = 0; x < this.gridSize; x++) {
			const first = this.tiles[x * this.gridSize];
			let colMatch = true;
			for(let y = 1; y < this.gridSize; y++) {
				if(this.tiles[x * this.gridSize + y] !== first) {
					colMatch = false;
					break;
				}
			}
			if(colMatch) return first;
		}

		/* Diagonals */
		// Left -> Right
		let diagMatch = this.tiles[0];
		for(let i = 0; i < this.gridSize; i++) {
			if(this.tiles[(this.gridSize + 1) * i] !== diagMatch) {
				diagMatch = -1;
				break;
			}
		}
		if(diagMatch >= 0) return diagMatch;

		// Right -> Left
		diagMatch = this.tiles[this.gridSize - 1];
		for(let i = 0; i < this.gridSize; i++) {
			if(this.tiles[(this.gridSize - 1) * (i + 1)] !== diagMatch) {
				diagMatch = -1;
				break;
			}
		}
		if(diagMatch >= 0) return diagMatch;

		// Test for tie
		// Just checks if all tiles aren't 0
		let tieTest = true;
		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] < 0) {
				tieTest = false;
				break;
			}
		}

		return (tieTest ? -99 : -1);
	}

	static getName() {
		return 'tictactoe';
	}
}

module.exports = TicTacToe;