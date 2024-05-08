import "./style.css";

enum SquareState {
    UNMARKED = "_",
    O = "O",
    X = "X",
}

enum Turn {
    O,
    X,
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

            if (Game.turn === Turn.X) {
                this.changeState(SquareState.X);
                this.element.classList.add("x");
                Game.turn = {
                    turn: Turn.O,
                    position: {
                        x: this.x,
                        y: this.y,
                    },
                };
                return;
            }
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
    static ended = false;

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
    }

    static getSerializedHorizontal() {
        const arr = [];
        for (const row of this.grid) {
			const horz = [];
            for (const col of row) {
                horz.push(col.state);
            }
			arr.push(horz.join(""));
        }

        return arr;
    }

    static getSerializedVertical() {
        const arr = [];
        for (let i = 0; i < 9; i++) {
			const vert = [];
            for (let j = 0; j < 9; j++) {
                vert.push(this.grid[j][i].state);
            }
			arr.push(vert.join(""));
        }

        return arr;
    }

    static getSerializedDiagonal() {
        const arr = [];

        for (let i = 4; i < 9; i++) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = this.grid[i - j][j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        for (let i = 7; i >= 4; i--) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = this.grid[8 - i + j][8 - j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        return arr;
    }

    static getSerializedDiagonal_2() {
        const arr = [];
        for (let i = 4; i < 9; i++) {
            const diag = [];
            for (let j = 0; j <= i; j++) {
                const { state } = this.grid[j][8 - i + j];
                diag.push(state);
            }

            arr.push(diag.join(""));
        }

        for (let i = 1; i < 5; i++) {
            const diag = [];
            for (let j = 0; j <= 8 - i; j++) {
                const { state } = this.grid[i + j][j];
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
    }

    static checkWin(x: number, y: number) {
		const horz = this.getSerializedHorizontal();
		const vert = this.getSerializedVertical();
		const diag = this.getSerializedDiagonal();
		const diag_2 = this.getSerializedDiagonal_2();

		console.log(horz, vert, diag, diag_2);

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
            if (counter >= 5) return true;

            back_x--;
        }

        let front_x = x + 1;
        while (front_x < 9 && this.grid[front_x][y].state === state) {
            counter++;
            if (counter >= 5) return true;

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
            if (counter >= 5) return true;

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

    constructor(side: Turn) {
        this.side = side;
    }

    move() {}
}

Game.construct();
