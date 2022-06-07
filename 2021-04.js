// const argv = require('minimist')(process.argv);
// const fs = require('fs/promises');

function parseInput(input) {
  const lines = input.split(/[\n\r]+/).filter(v => !!v);
  let lineNumber = 0;
  let boards = [];
  let draws = [];
  const numLines = lines.length;
  if (numLines < 6) {
    throw new Error(`There should be at least 6 lines, but found ${numLines} lines in input`);
  }
  if ((numLines - 1) % 5 !== 0) {
    throw new Error(`Num lines ${numLines} minus 1 should be divisible by 5`);
  }
  let currentBoard;

  for (const line of lines) {
    let values = line.trim().split(/[\s,]+/);
    const nonNumericValues = values.filter(v => isNaN(+v));
    if (nonNumericValues.length > 0) {
      throw new Error(`Found non-numeric value (${JSON.stringify(nonNumericValues)})`);
    }
    values = values.map(v => +v);

    if (lineNumber === 0) {
      // first row is draws
      draws = values;
    } else {
      // subsequent rows go in boards
      if (values.length !== 5) {
        throw new Error(`Board row should have 5 values, but found ${values.length} (line: ${lineNumber + 1}: ${JSON.stringify(line)})`);
      }

      // start a new board if necessary
      if ((lineNumber - 1) % 5 === 0) {
        currentBoard = [];
        boards.push(currentBoard);
      }

      currentBoard.push(values);
    }
    lineNumber++;
  }

  return {boards, draws};
}

function createMetaBoards(boards) {
  // metaBoards are objects that encapsulate all the possible winning vectors
  // and each object in a vector includes the value and whether it has been marked
  const metaBoards = [];
  for (const board of boards) {
    const metaBoard = {
      board,
      flatBoard: [],
      rows: [],
      columns: [],
    };

    const columns = [[],[],[],[],[]];
    for (const row of board) {
      const newRow = row.map((v, idx) => {
        const newSquare = {value: v, marked: false};
        columns[idx].push(newSquare);
        return newSquare;
      });
      metaBoard.rows.push(newRow);
    }

    metaBoard.flatBoard = metaBoard.rows.reduce((t, v) => t.concat(v), []);
    metaBoard.columns = columns;
    metaBoards.push(metaBoard);
  }

  return metaBoards;
}

function clearMetadata(metaBoards) {
  for (const board of metaBoards) {
    delete board.winningVector;
    delete board.winningDraw;
    delete board.order;

    // clear all the marks
    for (const square of board.flatBoard) {
      square.marked = false;
    }
  }
}

function simulate(draws, metaBoards, options = {onlyFindFirst: true}) {
  let winningBoards = [];
  let winningDraw = null;
  let winCounter = 0;

  // clear out all the metadata that gets set by this function first
  clearMetadata(metaBoards);

  for (const draw of draws) {
    let newWinner = false;
    for (const metaBoard of metaBoards) {
      if (metaBoard.order !== undefined) {
        // skip boards that have already been marked as winners
        continue;
      }
      // for each draw, mark all the boards as appropriate
      const squares = metaBoard.flatBoard.filter(v => v.value === draw);
      if (squares.length > 0) {
        let somethingGotMarked = false;
        for (const square of squares) {
          if (!square.marked) {
            square.marked = true;
            somethingGotMarked = true;
          }
        }

        if (!somethingGotMarked) {
          continue;
        }

        // and evaluate if the board has a win condition
        // only need to do this if something was marked
        for (const vector of metaBoard.rows.concat(metaBoard.columns)) {
          let somethingIsUnmarked = false;
          for (const square of vector) {
            if (!square.marked) {
              somethingIsUnmarked = true;
              break;
            }
          }
          if (!somethingIsUnmarked) {
            // it's a winner
            if (!newWinner) {
              winCounter++;
              newWinner = true;
            }

            winningDraw = draw;
            metaBoard.winningVector = vector;
            metaBoard.winningDraw = draw;
            metaBoard.order = winCounter;
            winningBoards.push(metaBoard);
            break;
          }
        }
      }
    }

    if (options.onlyFindFirst) {
      if (winningBoards.length > 0) {
        break;
      }
    }
  }

  return {winningBoards, winningDraw};
}

async function readInput() {
  let resolver, rejecter;
  let p = new Promise((r, j) => {
    resolver = r;
    rejecter = j;
  });

  let inputString = '';
  process.stdin.resume();
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
  });


  process.stdin.on('end', _ => {
    resolver(inputString);
  });

  process.stdin.on('errpr', e => {
    rejecter(e);
  });

  const ret = await p;
  return ret;
}

async function run () {
  // const inputFilename = argv.input || './input.txt';
  // const inputContent = await fs.readFile(inputFilename, 'utf8');

  const inputContent = await readInput();
  const {boards, draws} = parseInput(inputContent);
  const metaBoards = createMetaBoards(boards);

  let {winningBoards, winningDraw} = simulate(draws, metaBoards, {onlyFindFirst: true});
  for (const metaBoard of winningBoards) {
    const sumOfUnmarkedNumbers = metaBoard.flatBoard.filter(v => !v.marked).reduce((t, v) => t + v.value, 0);
    const score = sumOfUnmarkedNumbers * winningDraw;
    console.log(`Winning draw is ${winningDraw}`);
    console.log('Winning Board is', metaBoard.board);
    console.log('Winning vector is', metaBoard.winningVector.map(v => v.value));
    console.log(`Sum of unmarked squares is ${sumOfUnmarkedNumbers}`);
    console.log(`Score is ${score}`);
    console.log('=====================================');
    // console.log(JSON.stringify(metaBoard.rows, null, 2));
    // console.log(JSON.stringify(metaBoard.columns, null, 2));
  }

  ({ winningBoards } = simulate(draws, metaBoards, {onlyFindFirst: false}));
  winningBoards.sort((a, b) => {
    if (a.order > b.order) { return -1; }
    else if (a.order < b.order) { return +1; }
    return 0;
  });

  const lastWinningBoardOrder = winningBoards[0].order;
  const lastWinningBoards = winningBoards.filter(v => v.order === lastWinningBoardOrder);
  for (const metaBoard of lastWinningBoards) {
    winningDraw = metaBoard.winningDraw;
    // console.log('Orders: ', winningBoards.map(v => v.order));
    const sumOfUnmarkedNumbers = metaBoard.flatBoard.filter(v => !v.marked).reduce((t, v) => t + v.value, 0);
    const score = sumOfUnmarkedNumbers * winningDraw;
    console.log(`Last Winning draw is ${winningDraw}`);
    console.log('Last Winning Board is', metaBoard.board);
    console.log('Last Winning vector is', metaBoard.winningVector.map(v => v.value));
    console.log(`Sum of unmarked squares is ${sumOfUnmarkedNumbers}`);
    console.log(`Score is ${score}`);
    console.log('=====================================');
    // console.log(JSON.stringify(metaBoard.rows, null, 2));
    // console.log(JSON.stringify(metaBoard.columns, null, 2));
  }
}

run().then(v => console.log('Done')).catch(e => console.error(e));