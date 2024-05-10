import { DummySquare as Square } from "./main";
import { SquareState } from "./types";
import { getSerializedDiagonal, getSerializedDiagonal_2, getSerializedHorizontal, getSerializedVertical, checkWin } from "./utils";

const winnerMap = new Map();
const cacheMap = new Map();
const MAX_DEPTH = 3;

onmessage = (event) => {
    console.log(event.data);
    const { grid, side } = event.data;
    const move = bestMove(side, grid);

    postMessage({
        move,
    });
};

function bestMove(side: SquareState, grid: Square[][]) {
    const serial = getSerializedHorizontal(grid)
        .map((row) => row.join(""))
        .join("");

    if (serial.length === (serial.match(/\.+/g)?.[0] ?? "").length) {
        return [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)];
    }

    let bestScore = -Infinity;
    let retCoord: number[] | null = null;

    const toBeChecked = getSquare(grid);
    // console.log(toBeChecked);

    for (const coord of toBeChecked) {
        const [i, j] = coord;

        grid[i][j].state = side;
        const score = alphaBeta(side, grid, i, j, 0, -Infinity, Infinity, false);
        // console.log(coord, score);

        grid[i][j].state = SquareState.UNMARKED;

        if (score > bestScore) {
            bestScore = score;
            retCoord = [i, j];
        }
    }

    return retCoord;
}

function getSquare(grid: Square[][]): number[][] {
    let adjacent = [];
    let forcedWins = [];

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j].state !== SquareState.UNMARKED) continue;
            if (!isInLocal(i, j)) continue;

            adjacent.push([i, j]);

            grid[i][j].state = SquareState.O;
            if (checkWinner(grid, i, j)) forcedWins.push([i, j]);

            grid[i][j].state = SquareState.X;
            if (checkWinner(grid, i, j)) forcedWins.push([i, j]);

            grid[i][j].state = SquareState.UNMARKED;
        }
    }

    function isInLocal(i: number, j: number): boolean {
        const occupied = (i: number, j: number) => {
            if (i < 0 || j < 0) return false;
            if (i >= grid.length || j >= grid.length) return false;
            if (grid[i][j].state === SquareState.UNMARKED) return false;

            return true;
        };

        return (
            occupied(i + 1, j) ||
            occupied(i - 1, j) ||
            occupied(i, j + 1) ||
            occupied(i, j - 1) ||
            occupied(i + 1, j + 1) ||
            occupied(i - 1, j + 1) ||
            occupied(i + 1, j - 1) ||
            occupied(i - 1, j - 1)
        );
    }

    return forcedWins.length > 0 ? forcedWins : adjacent;
}

function checkWinner(grid: Square[][], i: number, j: number): SquareState | null {
    if (winnerMap.has(grid)) return winnerMap.get(grid);

    const winningState = checkWin(grid, i, j);
    if (winningState) {
        winnerMap.set(grid, winningState);
    }

    return winningState;
}

function alphaBeta(side: SquareState, grid: Square[][], i: number, j: number, depth: number, alpha: number, beta: number, isAiTurn: boolean): number {
    // console.log(`Depth: ${depth}\ti: ${i}\tj: ${j}\tisAi?: ${isAiTurn}\n${horz}`);
    const oppSide = side === SquareState.O ? SquareState.X : SquareState.O;

    const serial = getSerializedHorizontal(grid)
        .map((row) => row.join(""))
        .join("\n");

    if (cacheMap.get(serial)) {
        return cacheMap.get(serial);
    }

    const winningState = checkWin(grid, i, j);
    if (winningState) {
        const val = winningState !== side ? -10000 : 10000;

        cacheMap.set(serial, val);
        return val;
    }

    if (depth >= MAX_DEPTH) {
        const score = evaluation(side, grid);

        // if (Number.isNaN(score))
        //     console.log(score);

        // const horz = getSerializedHorizontal(grid).map(row => row.join("")).join("\n");
        // console.log(`Depth: ${depth}\ti: ${i}\tj: ${j}\tisAi?: ${isAiTurn}\nScore: ${score}\n${horz}`);
        return score;
    }

    let bestScore = isAiTurn ? -Infinity : Infinity;
    const toBeChecked = getSquare(grid);

    for (const coords of toBeChecked) {
        let [i, j] = coords;
        grid[i][j].state = isAiTurn ? side : oppSide;

        const temp = {
            grid,
            i,
            j,
            depth,
            alpha,
            beta,
            isAiTurn,
        };

        const horz = getSerializedHorizontal(grid)
            .map((row) => row.join(""))
            .join("\n");

        const score = alphaBeta(side, grid, i, j, depth + 1, alpha, beta, !isAiTurn);
        bestScore = isAiTurn ? Math.max(score, bestScore) : Math.min(score, bestScore);

        if (Number.isNaN(score)) {
            console.log(score, temp);
            console.log(horz);
        }

        // if (depth === 0) {
        //     const horz = getSerializedHorizontal(grid)
        //         .map((row) => row.join(""))
        //         .join("\n");
        //     console.log(`Depth: ${depth}\ti: ${i}\tj: ${j}\tisAi?: ${isAiTurn}\nScore: ${score}\n${horz}`);
        // }

        if (isAiTurn) {
            alpha = Math.max(alpha, bestScore);
        } else {
            beta = Math.min(beta, bestScore);
        }

        grid[i][j].state = SquareState.UNMARKED;

        if (alpha >= beta) break;
    }

    cacheMap.set(serial, bestScore);
    return bestScore;
}

function evaluation(side: SquareState, grid: Square[][]): number {
    const horz = hScore(grid) || 0;
    const vert = vScore(grid) || 0;
    const diag = dScore(grid) || 0;

    return horz + vert + diag;

    function hScore(grid: Square[][]): number {
        let score = 0;

        for (const row of getSerializedHorizontal(grid)) {
            let curr = SquareState.UNMARKED;
            let streak = 0;

            for (const col of row) {
                ({ curr, streak, score } = scoreConsecutive(col, curr, streak, score));
            }

            if (curr !== SquareState.UNMARKED) {
                score += (curr !== side ? 1 : -1) * adjacentBlockScore(streak);
            }
        }

        return -1 * score;
    }

    function vScore(grid: Square[][]): number {
        let score = 0;

        for (const col of getSerializedVertical(grid)) {
            let curr = SquareState.UNMARKED;
            let streak = 0;

            for (const row of col) {
                ({ curr, streak, score } = scoreConsecutive(row, curr, streak, score));
            }

            if (curr !== SquareState.UNMARKED) {
                score += (curr !== side ? 1 : -1) * adjacentBlockScore(streak);
            }
        }

        return -1 * score;
    }

    function dScore(grid: Square[][]): number {
        let score = 0;

        for (const row of getSerializedDiagonal(grid)) {
            let curr = SquareState.UNMARKED;
            let streak = 0;

            for (const block of row) {
                ({ curr, streak, score } = scoreConsecutive(block, curr, streak, score));
            }

            if (curr !== SquareState.UNMARKED) {
                score += (curr !== side ? 1 : -1) * adjacentBlockScore(streak);
            }
        }

        for (const row of getSerializedDiagonal_2(grid)) {
            let curr = SquareState.UNMARKED;
            let streak = 0;

            for (const block of row) {
                ({ curr, streak, score } = scoreConsecutive(block, curr, streak, score));
            }

            if (curr !== SquareState.UNMARKED) {
                score += (curr !== side ? 1 : -1) * adjacentBlockScore(streak);
            }
        }

        return -1 * score;
    }

    function scoreConsecutive(
        col: SquareState,
        curr: SquareState,
        streak: number,
        score: number
    ): { curr: SquareState; streak: number; score: number } {
        if (col !== curr) {
            if (curr !== SquareState.UNMARKED) {
                score += (curr !== side ? 1 : -1) * adjacentBlockScore(streak);
            }

            curr = col;
            streak = 1;
        } else {
            if (col !== SquareState.UNMARKED) streak++;
        }

        return {
            curr,
            streak,
            score,
        };
    }

    function adjacentBlockScore(streak: number): number {
        const scoreMatrix = [0, 2, 4, 8, 16, 32];
        return scoreMatrix[streak] ?? -1;
    }
}
