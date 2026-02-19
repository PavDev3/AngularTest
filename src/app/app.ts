import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Home } from './components/home/home';
import { TicTacToe } from './components/tic-tac-toe/tic-tac-toe';
import { MemoryGame } from './components/memory-game/memory-game';
import { SnakeGame } from './components/snake-game/snake-game';

export default {
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Home, TicTacToe, MemoryGame, SnakeGame]
};