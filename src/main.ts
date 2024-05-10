import "./style.css";

enum SquareState {
    UNMARKED = ".",
    O = "O",
    X = "X",
}

enum Turn {
    O = "O",
    X = "X",
}

class Square {
    element: HTMLDivElement;
    state: SquareState = SquareState.UNMARKED;
    x: number;
    y: number;

    constructor(row: number, column: number) {
        const square = document.createElement("div");
        square.classList.add("square");

        square.dataset.row = String(row);
        square.dataset.column = String(column);

        this.x = row;
        this.y = column;

        square.addEventListener("click", () => {
            if (this.state !== SquareState.UNMARKED || Game.ended) return;

            if (Game.turn === Turn.O) {
                this.changeState(SquareState.O);
                this.element.classList.add("o");
                Game.turn = {
                    turn: Turn.X,
                    position: {
                        x: this.x,
                        y: this.y,
                    },
                };
                return;
            }

            // if (Game.turn === Turn.X) {
            //     this.changeState(SquareState.X);
            //     this.element.classList.add("x");
            //     Game.turn = {
            //         turn: Turn.O,
            //         position: {
            //             x: this.x,
            //             y: this.y,
            //         },
            //     };
            //     return;
            // }
        });

        this.element = square;
    }

    changeState(state: SquareState) {
        this.state = state;
    }
}

class Game {
    static _turn = Turn.O;
    static grid: Square[][] = [];
    static _ended = false;
    static bot: Agent;

    static turnCount = 0;

    static construct() {
        const container = document.querySelector(".container");
        for (let i = 0; i < 9; i++) {
            const column: Square[] = [];
            for (let j = 0; j < 9; j++) {
                const square = new Square(i, j);
                container?.append(square.element);
                column.push(square);
            }
            this.grid.push(column);
        }
        this.bot = new Agent(Turn.X, this.grid);
    }

    static get ended() {
        return this._ended;
    }

    static set ended(value: boolean) {
        this._ended = value;
        alert(`${this.turn === Turn.O ? Turn.X : Turn.O} won!`);
    }

    static getSerializedBoard(pos: [number, number] | null = null, turn: Turn | null = null) {
        const board = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (pos !== null && turn !== null && i === pos[0] && j === pos[1]) board.push(turn);
                else board.push(this.grid[i][j].state);
            }
        }
        return board.join("");
    }

    static getCopy() {
        return this.grid.map((row) =>
            row.map((col) => {
                const square = new Square(col.x, col.y);
                square.state = col.state;
                return square;
            })
        );
    }

    static getSerializedHorizontal(grid: Square[][]) {
        const arr = [];
        for (const row of grid) {
            const horz = [];
            for (const col of row) {
                horz.push(col.state);
            }
            arr.push(horz.join(""));
        }

        return arr;
    }

    static getSerializedVertical(grid: Square[][]) {
        const arr = [];
        for (let i = 0; i < 9; i++) {
            const vert = [];
            for (let j = 0; j < 9; j++) {
                vert.push(grid[j][i].state);
            }
            arr.push(vert.join(""));
        }

        return arr;
    }

    static getSerializedDiagonal(grid: Square[][]) {
        const arr = [];

        for (let i = 4; i < 9; i++) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = grid[i - j][j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        for (let i = 7; i >= 4; i--) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = grid[8 - i + j][8 - j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        return arr;
    }

    static getSerializedDiagonal_2(grid: Square[][]) {
        const arr = [];
        for (let i = 4; i < 9; i++) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = grid[j][8 - i + j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        for (let i = 1; i < 5; i++) {
            const diag = [];
            for (let j = 0; j <= 8 - i; j++) {
                const { state } = grid[i + j][j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        return arr;
    }

    static get turn(): Turn {
        return this._turn;
    }

    static set turn(value: { turn: Turn; position: { x: number; y: number } }) {
        this._turn = value.turn;
        this.checkWin(value.position.x, value.position.y);

        if (value.turn === Turn.X) {
            this.bot.move_2();
        }

        this.turnCount++;

        // let moves = this.bot.move(5);
        // console.log(this.bot.board);
        // console.log(moves);
        // if (moves != null) {
        //     this.grid[moves[0]][moves[1]].changeState(SquareState.X);
        //     this.grid[moves[0]][moves[1]].element.classList.add("x");
        //     console.log(this.grid[moves[0]][moves[1]]);
        //     this.checkWin(moves[0], moves[1]);
        // }
    }

    static checkWin(x: number, y: number) {
        // Serialize to make key
        // const horz = this.getSerializedHorizontal();
        // const vert = this.getSerializedVertical();
        // const diag = this.getSerializedDiagonal();
        // const diag_2 = this.getSerializedDiagonal_2();
        // console.log(horz, vert, diag, diag_2);

        if (this.checkHorizontally(x, y)) {
            this.ended = true;
            return;
        }
        if (this.checkVertically(x, y)) {
            this.ended = true;
            return;
        }
        if (this.checkDiagonally(x, y)) {
            this.ended = true;
            return;
        }
        if (this.checkDiagonally_2(x, y)) {
            this.ended = true;
            return;
        }
    }

    static checkHorizontally(x: number, y: number): boolean {
        const state = this.grid[x][y].state;
        let counter = 0;

        let back_x = x;
        while (back_x >= 0 && this.grid[back_x][y].state === state) {
            counter++;
            if (counter >= 5) {
                return true;
            }
            back_x--;
        }

        let front_x = x + 1;
        while (front_x < 9 && this.grid[front_x][y].state === state) {
            counter++;
            if (counter >= 5) {
                return true;
            }
            front_x++;
        }

        return false;
    }
    static checkVertically(x: number, y: number): boolean {
        const state = this.grid[x][y].state;
        let counter = 0;

        let back_y = y;
        while (back_y >= 0 && this.grid[x][back_y].state === state) {
            counter++;
            if (counter >= 5) return true;
            back_y--;
        }

        let front_y = y + 1;
        while (front_y < 9 && this.grid[x][front_y].state === state) {
            counter++;
            if (counter >= 5) return true;
            front_y++;
        }

        return false;
    }
    static checkDiagonally(x: number, y: number): boolean {
        const state = this.grid[x][y].state;
        let counter = 0;

        let back_x = x;
        let back_y = y;
        while (back_y >= 0 && back_x >= 0 && this.grid[back_x][back_y].state === state) {
            counter++;
            if (counter >= 5) return true;
            back_x--;
            back_y--;
        }

        let front_x = x + 1;
        let front_y = y + 1;
        while (front_y < 9 && front_x < 9 && this.grid[front_x][front_y].state === state) {
            counter++;
            if (counter >= 5) break;
            front_x++;
            front_y++;
        }

        return false;
    }
    static checkDiagonally_2(x: number, y: number): boolean {
        const state = this.grid[x][y].state;
        let counter = 0;

        let back_x = x;
        let back_y = y;
        while (back_y >= 0 && back_x < 9 && this.grid[back_x][back_y].state === state) {
            counter++;
            if (counter >= 5) return true;
            back_x++;
            back_y--;
        }

        let front_x = x - 1;
        let front_y = y + 1;
        while (front_y < 9 && front_x >= 0 && this.grid[front_x][front_y].state === state) {
            counter++;
            if (counter >= 5) return true;
            front_x--;
            front_y++;
        }

        return false;
    }
}
class Agent {
    side: Turn;
    alphaMemmoi: { [key: string]: number };
    betaMemmoi: { [key: string]: number };
    board: Square[][];
    optimalMoves: { [key: string]: [number, number] };
    bestMove: [number, number] | null;

    constructor(side: Turn, board: Square[][]) {
        this.side = side;
        this.alphaMemmoi = {};
        this.betaMemmoi = {};
        this.optimalMoves = {};
        this.board = board;
        this.bestMove = null;
    }

    changeTurn(turn: Turn) {
        if (turn === Turn.O) return Turn.X;
        else return Turn.O;
    }

    /* 
       Function to evaluate the value of a board:
       Here aboard value will be evaluate bass on how close it is to win
    */
    checkWin(): boolean {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (
                    this.board[x][y].state !== SquareState.UNMARKED &&
                    (Game.checkHorizontally(x, y) ||
                        Game.checkVertically(x, y) ||
                        Game.checkDiagonally(x, y) ||
                        Game.checkDiagonally_2(x, y) === true)
                ) {
                    // console.log(Game.checkHorizontally(x, y));
                    // console.log(Game.checkVertically(x, y));
                    // console.log(Game.checkDiagonally(x, y));
                    // console.log(Game.checkDiagonally_2(x, y));
                    // console.log(x, y);
                    return true;
                }
            }
        }
        return false;
    }

    evalBoard(turn: Turn): number {
        // console.log(`Eval Serialized: ${this.evalBoard_serialized(turn)}`);

        let state = turn === Turn.O ? SquareState.O : SquareState.X;
        // console.log(this.evalBoardHorizontally(state));
        // console.log(this.evalBoardVertically(state));
        // console.log(this.evalBoardDiagonally(state));
        // console.log(this.evalBoardDiagonally_2(state));

        //    return this.evalBoardHorizontally(state) + this.evalBoardVertically(state) + this.evalBoardDiagonally(state) + this.evalBoardDiagonally_2(state);
        return Math.max(
            this.evalBoardHorizontally(state),
            this.evalBoardVertically(state),
            this.evalBoardDiagonally(state),
            this.evalBoardDiagonally_2(state)
        );
    }

    evalLine(lines: string[], turn: Turn): number {
        const EVAL_SCORE = {
            "0": 0,
            "1": 1,
            "2": 10,
            "3": 100,
            "4": 1000,
            "5": 10000,
        };

        return lines.reduce<number>((maxScore: number, curr: string) => {
            const matched = turn === Turn.O ? curr.match(/(?<!X)((O(O|\.)*O)|O)(?!X)/g) : curr.match(/(?<!O)((X(X|\.)*X)|X)(?!O)/g);

            const currScore =
                matched?.reduce<number>((score: number, currSplited: string) => {
                    const consecutiveHit = turn === Turn.O ? currSplited.match(/O+/g) : currSplited.match(/X+/g);
                    if (!consecutiveHit) return score;

                    const spaces = currSplited.match(/\.+/g);

                    const discreteScore =
                        EVAL_SCORE[
                            (String(
                                consecutiveHit?.reduce<number>((maxLength: number, currString: string) => {
                                    return Math.max(maxLength, currString.length);
                                }, 0)
                            ) as "1" | "2" | "3" | "4" | "5") ?? "0"
                        ];

                    const potentialScore =
                        EVAL_SCORE[
                            (String(
                                spaces?.reduce<number>((maxLength: number, currString: string, idx: number) => {
                                    if (currString.length > 1) return maxLength;

                                    return Math.max(maxLength, Math.min(consecutiveHit[idx].length + consecutiveHit[idx + 1].length, 4));
                                }, 0)
                            ) as "1" | "2" | "3" | "4" | "5") ?? "0"
                        ];

                    return Math.max(score, discreteScore, potentialScore ?? -10000);
                }, -10000) ?? -10000;

            if (currScore > maxScore) return currScore;
            return maxScore;
        }, -10000);
    }

    evalBoard_serialized(turn: Turn, grid: Square[][], log = false): number {
        // Serialize to make key
        const horz = Game.getSerializedHorizontal(grid);
        const vert = Game.getSerializedVertical(grid);
        const diag = Game.getSerializedDiagonal(grid);
        const diag_2 = Game.getSerializedDiagonal_2(grid);

        const oppTurn = turn === Turn.O ? Turn.X : Turn.O;
        // console.log(turn, oppTurn);

        const horzScore = this.evalLine(horz, turn);
        // const vertScore = this.evalLine(vert, turn);
        // const diagScore = this.evalLine(diag, turn);
        // const diag_2Score = this.evalLine(diag_2, turn);

        // console.log(`H: ${horzScore}\nV: ${vertScore}\nD: ${diagScore}\nZ: ${diag_2Score}`)
        // console.log(`H: ${horzScore}`);

        if (log) {
            console.log(this.evalLine(horz, turn), this.evalLine(horz, oppTurn));
        }

        // return Math.max(horzScore, vertScore, diagScore, diag_2Score);
        return Math.max(horzScore);
    }

    move_2() {
        if (Game.turnCount < 4) {
            let i = Math.floor(Math.random() * 9);
            let j = Math.floor(Math.random() * 9);

            while (Game.grid[i][j].state !== SquareState.UNMARKED) {
                i = Math.floor(Math.random() * 9);
                j = Math.floor(Math.random() * 9);
            }

            Game.grid[i][j].changeState(SquareState.X);
            Game.grid[i][j].element.classList.add("x");
            Game.turn = {
                turn: Turn.O,
                position: {
                    x: i,
                    y: j,
                },
            };

            return;
        }

        const { value, pos } = this.minimax_2(2, true);

        Game.grid[pos.x][pos.y].changeState(SquareState.X);
        Game.grid[pos.x][pos.y].element.classList.add("x");
        Game.turn = {
            turn: Turn.O,
            position: {
                x: pos.x,
                y: pos.y,
            },
        };

        this.evalBoard_serialized(Turn.X, Game.grid, true);

        console.log(value, pos);
    }

    minimax_2(depth: number, maximize: boolean): { value: number; pos: { x: number; y: number } } {
        let current = maximize ? -10000 : 10000;
        let currentPos = {
            x: 0,
            y: 0,
        };

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const copyGrid = Game.getCopy();

                if (copyGrid[i][j].state !== SquareState.UNMARKED) {
                    continue;
                }

                if (depth !== 0) {
                    const { value, pos } = this.minimax_2(depth - 1, !maximize);

                    if (maximize && value >= current) {
                        current = value;
                        currentPos = pos;
                    }
    
                    if (!maximize && value <= current) {
                        current = value;
                        currentPos = pos;
                    }
                    
                    continue;
                }

                copyGrid[i][j].state = maximize ? SquareState.X : SquareState.O;
                const value = this.evalBoard_serialized(this.side, copyGrid);

                if (maximize && value >= current) {
                    current = value;
                    currentPos = {
                        x: i,
                        y: j
                    };
                }

                if (!maximize && value <= current) {
                    current = value;
                    currentPos = {
                        x: i,
                        y: j
                    };
                }
            }
        }

        return {
            value: current,
            pos: {
                x: currentPos.x,
                y: currentPos.y
            }
        }
    }

    evalBoardHorizontally(state: SquareState): number {
        const check: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
        let boardValue = -10000;
        for (let x = 0; x < 9; x++)
            for (let y = 0; y < 9; y++) {
                let counter = 0;
                let evalScore = 0;
                if (this.board[x][y].state !== SquareState.UNMARKED) {
                    if (check[x][y] == false) {
                        let back_x = x;
                        let curstate = this.board[x][y].state;

                        while (back_x >= 0 && this.board[back_x][y].state === curstate) {
                            counter++;
                            check[x][y] = true;
                            back_x--;
                        }

                        let front_x = x + 1;
                        while (front_x < 9 && this.board[front_x][y].state === curstate) {
                            counter++;
                            check[x][y] = true;
                            front_x++;
                        }

                        if (state === curstate) {
                            evalScore = 2 * counter;
                            if ((back_x >= 0 && this.board[back_x][y].state !== SquareState.UNMARKED) || back_x < 0) {
                                evalScore -= counter;
                            }

                            if ((front_x < 9 && this.board[front_x][y].state !== SquareState.UNMARKED) || front_x >= 9) {
                                evalScore -= counter;
                            }
                        }

                        if (state !== curstate) {
                            evalScore = 0;
                            if (back_x >= 0 && this.board[back_x][y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }

                            if (front_x < 9 && this.board[front_x][y].state !== SquareState.UNMARKED) {
                                evalScore += counter + 3;
                            }
                        }
                        boardValue = Math.max(evalScore, boardValue);
                    }
                }
            }
        return boardValue;
    }

    evalBoardVertically(state: SquareState): number {
        const check: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
        let boardValue = -10000;
        for (let x = 0; x < 9; x++)
            for (let y = 0; y < 9; y++) {
                let counter = 0;
                let evalScore = 0;
                if (this.board[x][y].state !== SquareState.UNMARKED) {
                    if (check[x][y] == false) {
                        let back_y = y;
                        let curstate = this.board[x][y].state;
                        while (back_y >= 0 && this.board[x][back_y].state === curstate) {
                            counter++;
                            check[x][y] = true;
                            back_y--;
                        }

                        let front_y = y + 1;
                        while (front_y < 9 && this.board[x][front_y].state === curstate) {
                            counter++;
                            check[x][y] = true;
                            front_y++;
                        }

                        if (state === curstate) {
                            evalScore = 2 * counter;
                            if ((back_y >= 0 && this.board[x][back_y].state !== SquareState.UNMARKED) || back_y < 0) {
                                evalScore -= counter;
                            }
                            if ((front_y < 9 && this.board[x][front_y].state !== SquareState.UNMARKED) || front_y >= 9) {
                                evalScore -= counter;
                            }
                        }

                        if (state !== curstate) {
                            evalScore = 0;
                            if (back_y >= 0 && this.board[x][back_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }

                            if (front_y < 9 && this.board[x][front_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }
                        }
                        boardValue = Math.max(boardValue, evalScore);
                    }
                }
            }
        return boardValue;
    }

    evalBoardDiagonally(state: SquareState): number {
        const check: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
        let boardValue = -10000;
        for (let x = 0; x < 9; x++)
            for (let y = 0; y < 9; y++) {
                let counter = 0;
                let evalScore = 0;
                if (this.board[x][y].state !== SquareState.UNMARKED) {
                    if (check[x][y] == false) {
                        let back_x = x;
                        let back_y = y;
                        let curstate = this.board[x][y].state;
                        while (back_y >= 0 && back_x >= 0 && this.board[back_x][back_y].state === curstate) {
                            counter++;
                            back_x--;
                            back_y--;
                        }
                        let front_x = x + 1;
                        let front_y = y + 1;
                        while (front_y < 9 && front_x < 9 && this.board[front_x][front_y].state === curstate) {
                            counter++;
                            front_x++;
                            front_y++;
                        }

                        if (state === curstate) {
                            evalScore = 2 * counter;
                            if (
                                (back_y >= 0 && back_x >= 0 && this.board[back_x][back_y].state !== SquareState.UNMARKED) ||
                                back_y < 0 ||
                                back_x < 0
                            ) {
                                evalScore -= counter;
                            }
                            if (
                                (front_y < 9 && front_x < 9 && this.board[front_x][front_y].state !== SquareState.UNMARKED) ||
                                front_y >= 9 ||
                                front_x >= 9
                            ) {
                                evalScore -= counter;
                            }
                        }

                        if (state !== curstate) {
                            evalScore = 0;
                            if (back_y >= 0 && back_x >= 0 && this.board[back_x][back_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }

                            if (front_y < 9 && front_x < 9 && this.board[front_x][front_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }
                        }

                        boardValue = Math.max(boardValue, evalScore);
                    }
                }
            }
        return boardValue;
    }

    evalBoardDiagonally_2(state: SquareState): number {
        const check: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
        let boardValue = -10000;
        for (let x = 0; x < 9; x++)
            for (let y = 0; y < 9; y++) {
                let counter = 0;
                let evalScore = 0;
                if (this.board[x][y].state !== SquareState.UNMARKED) {
                    if (check[x][y] == false) {
                        let back_x = x;
                        let back_y = y;
                        let curstate = this.board[x][y].state;
                        while (back_y >= 0 && back_x < 9 && this.board[back_x][back_y].state === curstate) {
                            counter++;
                            back_x++;
                            back_y--;
                        }

                        let front_x = x - 1;
                        let front_y = y + 1;
                        while (front_y < 9 && front_x >= 0 && this.board[front_x][front_y].state === curstate) {
                            counter++;
                            front_x--;
                            front_y++;
                        }

                        if (state === curstate) {
                            evalScore = 2 * counter;
                            if (
                                (back_y >= 0 && back_x < 9 && this.board[back_x][back_y].state !== SquareState.UNMARKED) ||
                                back_y < 0 ||
                                back_x >= 9
                            ) {
                                evalScore -= counter;
                            }
                            if (
                                (front_y < 9 && front_x >= 0 && this.board[front_x][front_y].state !== SquareState.UNMARKED) ||
                                front_y >= 9 ||
                                front_x < 0
                            ) {
                                evalScore -= counter;
                            }
                        }

                        if (state !== curstate) {
                            evalScore = 0;
                            if (back_y >= 0 && back_x < 9 && this.board[back_x][back_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }

                            if (front_y < 9 && front_x >= 0 && this.board[front_x][front_y].state !== SquareState.UNMARKED) {
                                evalScore += counter * 2;
                            }
                        }
                        boardValue = Math.max(boardValue, evalScore);
                    }
                }
            }
        return boardValue;
    }

    // Minimax function getcomputer move to get the computer move
    miniMax(depth: number, turn: Turn = this.side, alpha: number = -10000, beta: number = 10000) {
        // Alpha beta value to cut off branch
        // Only when beta > alpha we consider the branch need to evaluate

        const boardScore = this.evalBoard(turn);
        let printBoard = Game.getSerializedHorizontal(Game.grid);

        console.log("Board sates: ");
        console.log(depth);
        console.log(this.changeTurn(turn));
        for (let line in printBoard) {
            console.log(printBoard[line]);
        }
        console.log(boardScore);

        if (depth == 0 || this.checkWin() == true) {
            //evaluate the value of current board here through currentMoves.
            if (turn === Turn.O) return -boardScore;
            return boardScore;
        }
        // Start to evaluate all possible moves
        // Note that here we have to seperate two loop since the cut off using alpha beta

        if (turn === Turn.X) {
            let maxEval = -10000;
            for (let x = 0; x < 9; x++)
                for (let y = 0; y < 9; y++) {
                    if (this.board[x][y].state === SquareState.UNMARKED) {
                        // Making move and serialize to store the state for later lookup
                        this.board[x][y].state = SquareState.X;
                        let currentBoard = Game.getSerializedBoard([x, y], turn);
                        let evalScore = 0;
                        if (currentBoard in this.alphaMemmoi) {
                            // console.log("Memoi X");
                            evalScore = this.alphaMemmoi[currentBoard];
                            for (let i = 0; i < currentBoard.length; i += 9) {
                                console.log(currentBoard.slice(i, i + 9));
                            }
                        } else {
                            evalScore = this.miniMax(depth - 1, this.changeTurn(turn), alpha, beta);
                            this.alphaMemmoi[currentBoard] = evalScore;
                        }
                        if (maxEval < evalScore) {
                            this.bestMove = [x, y];
                            maxEval = Math.max(evalScore, maxEval);
                        }
                        alpha = Math.max(evalScore, alpha);
                        this.board[x][y].state = SquareState.UNMARKED;
                        if (beta <= alpha) {
                            break;
                        }
                    }
                }
            return maxEval;
        } else {
            let minEval = 10000;
            for (let x = 0; x < 9; x++)
                for (let y = 0; y < 9; y++) {
                    if (this.board[x][y].state === SquareState.UNMARKED) {
                        // Making move and serialize to store the state for later lookup
                        this.board[x][y].state = SquareState.O;
                        let currentBoard = Game.getSerializedBoard([x, y], turn);
                        let evalScore = 0;
                        if (currentBoard in this.betaMemmoi) {
                            // console.log("Memoi O");
                            evalScore = this.betaMemmoi[currentBoard];
                        } else {
                            evalScore = this.miniMax(depth - 1, this.changeTurn(turn), alpha, beta);
                            this.betaMemmoi[currentBoard] = evalScore;
                        }
                        if (minEval > evalScore) {
                            this.bestMove = [x, y];
                            minEval = Math.min(evalScore, minEval);
                        }
                        beta = Math.min(evalScore, beta);
                        this.board[x][y].state = SquareState.UNMARKED;
                        if (beta <= alpha) {
                            break;
                        }
                    }
                }
            return minEval;
        }
    }
    move(depth: number): [number, number] | null {
        this.bestMove = null;
        this.miniMax(1);
        return this.bestMove;
    }
}

Game.construct();
