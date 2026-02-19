import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tic-tac-toe',
  imports: [NgClass],
  templateUrl: './tic-tac-toe.html',
  styleUrl: './tic-tac-toe.scss'
})
export class TicTacToe {
  cells: string[] = Array(9).fill('');
  currentPlayer: 'X' | 'O' = 'X';
  winner: string | null = null;
  status = 'Turno del jugador X';
  scoreX = 0;
  scoreO = 0;
  winningCells: number[] = [];

  private winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  makeMove(index: number): void {
    if (this.cells[index] || this.winner) return;

    this.cells[index] = this.currentPlayer;
    
    if (this.checkWin()) {
      this.winner = this.currentPlayer;
      this.status = `🎉 ¡Jugador ${this.currentPlayer} gana!`;
      this.currentPlayer === 'X' ? this.scoreX++ : this.scoreO++;
    } else if (this.cells.every(cell => cell)) {
      this.status = '🤝 ¡Empate!';
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.status = `Turno del jugador ${this.currentPlayer}`;
    }
  }

  checkWin(): boolean {
    for (const pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (this.cells[a] && this.cells[a] === this.cells[b] && this.cells[a] === this.cells[c]) {
        this.winningCells = pattern;
        return true;
      }
    }
    return false;
  }

  isWinningCell(index: number): boolean {
    return this.winningCells.includes(index);
  }

  resetGame(): void {
    this.cells = Array(9).fill('');
    this.currentPlayer = 'X';
    this.winner = null;
    this.status = 'Turno del jugador X';
    this.winningCells = [];
  }

  resetScores(): void {
    this.scoreX = 0;
    this.scoreO = 0;
    this.resetGame();
  }
}