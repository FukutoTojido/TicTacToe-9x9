import { SquareState } from "./types";
import { S } from "./main";

export function checkWin(grid: S[][], x: number, y: number): SquareState | null {
    const horz = checkHorizontally(grid, x, y);
    const vert = checkVertically(grid, x, y);
    const dia1 = checkDiagonally(grid, x, y);
    const dia2 = checkDiagonally_2(grid, x, y);

    if (horz) {
        // this.ended = true;
        return horz;
    }

    if (vert) {
        // this.ended = true;
        return vert;
    }

    if (dia1) {
        // this.ended = true;
        return dia1;
    }

    if (dia2) {
        // this.ended = true;
        return dia2;
    }

    return null;
}

export function checkHorizontally(grid: S[][], x: number, y: number): SquareState | null {
    const state = grid[x][y].state;
    let counter = 0;

    let back_x = x;
    while (back_x >= 0 && grid[back_x][y].state === state) {
        counter++;
        if (counter >= 5) {
            return state;
        }
        back_x--;
    }

    let front_x = x + 1;
    while (front_x < 9 && grid[front_x][y].state === state) {
        counter++;
        if (counter >= 5) {
            return state;
        }
        front_x++;
    }

    return null;
}

export function checkVertically(grid: S[][], x: number, y: number): SquareState | null {
    const state = grid[x][y].state;
    let counter = 0;

    let back_y = y;
    while (back_y >= 0 && grid[x][back_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        back_y--;
    }

    let front_y = y + 1;
    while (front_y < 9 && grid[x][front_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        front_y++;
    }

    return null;
}

export function checkDiagonally(grid: S[][], x: number, y: number): SquareState | null {
    const state = grid[x][y].state;
    let counter = 0;

    let back_x = x;
    let back_y = y;
    while (back_y >= 0 && back_x >= 0 && grid[back_x][back_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        back_x--;
        back_y--;
    }

    let front_x = x + 1;
    let front_y = y + 1;
    while (front_y < 9 && front_x < 9 && grid[front_x][front_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        front_x++;
        front_y++;
    }

    return null;
}

export function checkDiagonally_2(grid: S[][], x: number, y: number): SquareState | null {
    const state = grid[x][y].state;
    let counter = 0;

    let back_x = x;
    let back_y = y;
    while (back_y >= 0 && back_x < 9 && grid[back_x][back_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        back_x++;
        back_y--;
    }

    let front_x = x - 1;
    let front_y = y + 1;
    while (front_y < 9 && front_x >= 0 && grid[front_x][front_y].state === state) {
        counter++;
        if (counter >= 5) return state;
        front_x--;
        front_y++;
    }

    return null;
}

export function getSerializedHorizontal(grid: S[][]) {
    const arr = [];
    for (const row of grid) {
        const horz = [];
        for (const col of row) {
            horz.push(col.state);
        }
        arr.push(horz);
    }

    return arr;
}

export function getSerializedVertical(grid: S[][]) {
    const arr = [];
    for (let i = 0; i < 9; i++) {
        const vert = [];
        for (let j = 0; j < 9; j++) {
            vert.push(grid[j][i].state);
        }
        arr.push(vert);
    }

    return arr;
}

export function getSerializedDiagonal(grid: S[][]) {
    const arr = [];

    for (let i = 4; i < 9; i++) {
        const diag = [];
        for (let j = 0; j <= i; j++) {
            const { state } = grid[i - j][j];
            diag.push(state);
        }

        arr.push(diag);
    }

    for (let i = 7; i >= 4; i--) {
        const diag = [];
        for (let j = 0; j <= i; j++) {
            const { state } = grid[8 - i + j][8 - j];
            diag.push(state);
        }

        arr.push(diag);
    }

    return arr;
}

export function getSerializedDiagonal_2(grid: S[][]) {
    const arr = [];
    for (let i = 4; i < 9; i++) {
        const diag = [];
        for (let j = 0; j <= i; j++) {
            const { state } = grid[j][8 - i + j];
            diag.push(state);
        }

        arr.push(diag);
    }

    for (let i = 1; i < 5; i++) {
        const diag = [];
        for (let j = 0; j <= 8 - i; j++) {
            const { state } = grid[i + j][j];
            diag.push(state);
        }

        arr.push(diag);
    }

    return arr;
}