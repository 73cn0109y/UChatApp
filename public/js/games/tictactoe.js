/**
 * Created by texpe on 14/02/2017.
 */

const CoreGame = require('./core_game');

class TicTacToe extends CoreGame {
	constructor(client) {
		super(client);
		this.name = 'TicTacToe';
		this.drawRate = 5; // It's TicTacToe not fucking Battlefield
		this.canvas.lineWidth = 5;
		this.canvas.strokeStyle = 'rgb(200, 200, 200)';
		this.setImage('imgs/games/tictactoe/background.png');

		this.tiles = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.playerTurn = 1;
		this.drawAfterWon = false;
	}

	new() {
		this.tiles = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.playerTurn = 1;

		super.new();
	}

	processInput(data) {
		if(this.players.length < 2)
			return this.outputMessage('You need to add 2 players to the game!');

		let message = data.Message.split(' ');

		let isPlayer = false;

		if(!data.Sender && !data.isBroadcaster) return;
		if(data.Sender && data.Sender.toLowerCase() === this.players[this.playerTurn - 1].toLowerCase())
			isPlayer = true;
		if(data.isBroadcaster && this.players[this.playerTurn - 1].toLowerCase() === '$broadcaster')
			isPlayer = true;

		if(!isPlayer) return;

		if(message.length < 2) return this.outputMessage('Please specify what square you want to take!');

		const square = parseInt(message[1]);
		if(isNaN(square)) return this.outputMessage('Please enter a valid number!');

		if(this.tiles[square - 1] !== 0)
			return this.outputMessage('That tile has already been taken!');

		this.tiles[square - 1] = this.playerTurn;

		this.playerTurn = (this.playerTurn === 1 ? 2 : 1);
		return null;
	}

	update() {
		let winner = this.checkWinner();
		if(winner > 0) {
			if(this.drawAfterWon) {
				this.stop();
				winner = this.players[winner - 1];
				if(winner === '$broadcaster') winner = 'The broadcaster';
				return this.outputMessage(`${winner} has won!`);
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
			width: this.canvas.size.width / 3,
			height: this.canvas.size.height / 3
		};

		this.canvas.context.fillStyle = 'rgb(30,30,30)';
		for(let i = 0; i < this.tiles.length; i++) {
			if(this.tiles[i] === 0) continue; // Not occupied

			const row = Math.floor(i / 3);
			const col = Math.floor(i % 3);

			if(this.tiles[i] === 1) // Player 1 (X)
				this.drawX(col, row, tileSize);
			else if(this.tiles[i] === 2) // Player 2 (O)
				this.drawO(col, row, tileSize);
		}
	}

	drawX(row, col, tileSize) {
		let x = tileSize.width * row;
		let y = tileSize.height * col;
		let size = [(tileSize.width / 8) * 3, (tileSize.height / 4) * 2];

		this.canvas.context.fillRect(x + 5, y + 5, tileSize.width - 10, tileSize.height - 10);

		x += (tileSize.width / 8) * 2.5;
		y += tileSize.height / 4;

		this.canvas.context.beginPath();
		this.canvas.context.moveTo(x, y);
		this.canvas.context.lineTo(x + size[0], y + size[1]);
		this.canvas.context.moveTo(x + size[0], y);
		this.canvas.context.lineTo(x, y + size[1]);
		this.canvas.context.closePath();

		this.canvas.context.stroke();
	}

	drawO(row, col, tileSize) {
		let x = tileSize.width * row;
		let y = tileSize.height * col;
		let size = [(tileSize.width / 4) * 2, (tileSize.height / 4) * 2];

		this.canvas.context.fillRect(x + 5, y + 5, tileSize.width - 10, tileSize.height - 10);

		x += tileSize.width / 2;
		y += tileSize.height / 2;

		this.canvas.context.beginPath();
		this.canvas.context.arc(x, y, 30, 0, 2 * Math.PI);
		this.canvas.context.closePath();

		this.canvas.context.stroke();
	}

	checkWinner() {
		// Rows
		for(let y = 0; y < 3; y++) {
			const first = this.tiles[y * 3 + 0];
			if(this.tiles[y * 3 + 1] === first && this.tiles[y * 3 + 2] === first)
				return first;
		}
		// Columns
		for(let x = 0; x < 3; x++) {
			const first = this.tiles[x * 3];
			if(this.tiles[(x + 1) * 3] === first && this.tiles[(x + 2) * 3])
				return first;
		}
		// Diagonals
		let diagFirst = this.tiles[0];
		if(this.tiles[4] === diagFirst && this.tiles[8] === diagFirst)
			return diagFirst;
		diagFirst = this.tiles[2];
		if(this.tiles[4] === diagFirst && this.tiles[6] === diagFirst)
			return diagFirst;
		return -1;
	}

	static getName() {
		return 'tictactoe';
	}
}

module.exports = TicTacToe;