import "./style.css";
import { SquareState, Turn } from "./types";
import { checkWin } from "./utils";
// import { bestMove } from "./worker";

import MyWorker from "./worker?worker";

export type S = DummySquare | Square;

export class DummySquare {
    state: SquareState = SquareState.UNMARKED;
    x: number;
    y: number;

    constructor(row: number, column: number) {
        this.x = row;
        this.y = column;
    }

    changeState(state: SquareState) {
        this.state = state;
    }
}

export class Square {
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

            // if (Game.turn === Turn.O) {
            //     this.changeState(SquareState.O);
            //     this.element.classList.add("o");
            //     Game.turn = {
            //         turn: Turn.X,
            //         position: {
            //             x: this.x,
            //             y: this.y,
            //         },
            //     };
            //     return;
            // }

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

export class Game {
    static _turn = Turn.O;
    static grid: Square[][] = [];
    static _ended = false;
    static bot1: Agent | VeryStupidAgent;
    static bot2: VeryStupidAgent | Agent;

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

        this.bot1 = new Agent(Turn.X);
        this.bot2 = new VeryStupidAgent(Turn.O);
    }

    static getCopy() {
        return this.grid.map((row) =>
            row.map((col) => {
                const square = new DummySquare(col.x, col.y);
                square.state = col.state;
                return square;
            })
        );
    }

    static get ended() {
        return this._ended;
    }

    static set ended(value: boolean) {
        this._ended = value;
        alert(`${this.turn === Turn.O ? Turn.X : Turn.O} won!`);
    }

    static get turn(): Turn {
        return this._turn;
    }

    static set turn(value: { turn: Turn; position: { x: number; y: number } }) {
        this._turn = value.turn;
        if (checkWin(Game.grid, value.position.x, value.position.y)) this.ended = true;

        if (value.turn === this.bot1.side && !this.ended) {
            this.bot1.move();
        }

        if (value.turn === this.bot2.side && !this.ended) {
            this.bot2.move();
        }
    }
}

class Agent {
    side: Turn;
    worker: Worker;

    constructor(side: Turn) {
        this.side = side;
        this.worker = new MyWorker();
    }

    move() {
        this.worker.postMessage({
            grid: Game.getCopy(),
            side: this.side,
        });

        this.worker.onmessage = (event) => {
            const coords = event.data.move;
            if (!coords) {
                throw new Error("WHAT THE HELL??");
            }
            Game.grid[coords[0]][coords[1]].changeState(SquareState.X);
            Game.grid[coords[0]][coords[1]].element.classList.add("x");
            Game.turn = {
                turn: Turn.O,
                position: {
                    x: coords[0],
                    y: coords[1],
                },
            };
        };
    }
}

class VeryStupidAgent {
    side: Turn;

    constructor(side: Turn) {
        this.side = side;
    }

    move() {
        let i = Math.floor(Math.random() * 9);
        let j = Math.floor(Math.random() * 9);

        while (Game.grid[i][j].state !== SquareState.UNMARKED) {
            i = Math.floor(Math.random() * 9);
            j = Math.floor(Math.random() * 9);
        }

        Game.grid[i][j].changeState(this.side === Turn.O ? SquareState.O : SquareState.X);
        Game.grid[i][j].element.classList.add(this.side === Turn.O ? "o" : "x");

        Game.turn = {
            turn: this.side === Turn.O ? Turn.X : Turn.O,
            position: {
                x: i,
                y: j,
            },
        };
    }
}

Game.construct();
Game.bot2.move();
