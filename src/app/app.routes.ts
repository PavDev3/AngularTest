import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { TicTacToe } from './components/tic-tac-toe/tic-tac-toe';
import { MemoryGame } from './components/memory-game/memory-game';
import { SnakeGame } from './components/snake-game/snake-game';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tic-tac-toe', component: TicTacToe },
  { path: 'memory', component: MemoryGame },
  { path: 'snake', component: SnakeGame },
  { path: '**', redirectTo: '' }
];