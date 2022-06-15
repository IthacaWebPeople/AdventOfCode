// https://adventofcode.com/2021/day/4
const fs = require('fs');
const playingToWin = true; // change to false for pt.2

/** Load game file then start game */
fs.readFile('./2021-04-data.txt', (err, data) => {
  if (err) throw err;
  startGame( parseData(data) );
});

/** Convert text data to int arrays */
function parseData(input) {
  const gameData = input.toString().split(/\r?\n\n/);
  // the first is the call numbers, the rest are boards
  // convert call numbers to an int array
  callNumbers = gameData.shift().split(',').map(Number)
  // convert boards to arrays of arrays of ints
  const boards = gameData.map(b => b.trim().split('\n').map(r => r.trim().split(/\s+/).map(Number)));
  return [callNumbers, boards]
}


/** Run game loop until win, then print result */
function startGame(gameData) {
  const callNumbers = gameData[0];
  const boards = gameData[1].map((b,i) => new Board(b,i));
  const game = new BingoGame(callNumbers, boards, playingToWin);

  // Game Loop until game won or no numbers left depending on game mode
  while (!game.getGameWon() && game.getNumbersRemaining() > 0) {
    game.printGameState();
    game.callNewNumber( game.getNextNumber() );
  }
  // done
  game.printWinMessage(); // last winning board
}


/**
 * Bingo Game
 * callNumbers: Int array
 * boards: Boards array
 * playingToWin: bool
 */
class BingoGame {
  constructor(callNumbers, boards, playingToWin=true) {
    this.callNumbers = callNumbers;
    this.boards = boards;
    this.playingToWin = playingToWin;
    this.gameWon = false;
    this.winningBoard = null;
    this.winningScore = null;
    this.winningNumber = null;
  }
  setWinningScore(board) {
    this.winningScore = this.calculateScore(board);
  }
  // Has the game been won. Returns Bool
  getGameWon() {
    return this.gameWon;
  }
  // Number of remaining call numbers. Returns Int
  getNumbersRemaining() {
    return this.callNumbers.length;
  }
  // Returns next number and removes from call list. Returns Int
  getNextNumber() {
    return this.callNumbers.shift();
  }
  // Return Int
  calculateScore(board) {
    let remainingNumbers = board.getFinalBoard();
    let remainingTotal = remainingNumbers.flat().reduce((p,c) => p + c);
    return remainingTotal * this.winningNumber;
  }
  callNewNumber(callNumber) {
    if (this.playingToWin) {
      for (let thisBoard of this.boards) { // check all the boards for a win
        thisBoard.checkNewNumber(callNumber)
        if(thisBoard.checkForWins()) { 
          this.gameWon = true;
          this.winningBoard = thisBoard;
          this.winningNumber = callNumber;
          this.setWinningScore(thisBoard);
          break; // break at first board with a winning line
        }
      }
    }
    else { // Playing for last version
      let boardsToRemove = new Set()
      for (let thisBoard of this.boards) { // check all the remaining boards for a win
        thisBoard.checkNewNumber(callNumber);
        if(thisBoard.checkForWins()) { // board has a winning line
            this.winningBoard = thisBoard;
            this.winningNumber = callNumber;
            this.setWinningScore(thisBoard);
            boardsToRemove.add(thisBoard.id);
        }
      }
      this.boards = this.boards.filter(b => !boardsToRemove.has(b.id) );
    }
  }
  // Console Log
  printGameState() {
    console.log(this.getNumbersRemaining() ? 'Calling ' + this.callNumbers[0] : 'No Winners');
  }
  // Console Log
  printWinMessage() {
    console.log("Winning Number:" + this.winningNumber);
    console.log("Winning Score:" + this.winningScore);
    this.winningBoard.printBoard();
  }
}

/**
 * Board
 * rows: Int Array Array
 * i: int
 */
class Board {
  constructor(rows, i) {
    this.id = i;
    this.solutions = this.setSolutions(rows); // rows and columns
  }
  // returns int array of rows and columns
  setSolutions(rows) {
    let columns = [];
    for (let i=0; i<rows.length; i++) {
      for (let j=0; j<rows[i].length; j++) {
          if (columns[j]) {
            columns[j].push(rows[i][j]);
          }
          else {
            columns[j] = [rows[i][j]];
          }
      }
    }
    return rows.concat(columns);
  }
  // Remove called number from every solution on board
  checkNewNumber(num) {
    this.solutions = this.solutions.map(s => s.filter(x => x != num))
  }
  // Checks if any rows have been completed, (all numbers called). Returns bool
  checkForWins() {
    for (let i=0; i<this.solutions.length; i++) {
      if (this.solutions[i].length == 0) {
        return true
      }
    }
    return false;
  }
  // Return Int Array
  getFinalBoard() {
    return this.solutions.slice(0,5) // just the original rows 
  }
  // Console Log
  printBoard() {
    console.log("remaining rows: ", this.solutions.slice(0,5))
    console.log("remaining columns: ", this.solutions.slice(5,10))
  }
}

