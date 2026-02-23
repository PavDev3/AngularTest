import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memory-game',
  imports: [NgClass],
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.scss'
})
export class MemoryGame implements OnInit {
  // Emojis para las cartas
  private readonly emojis = ['🎮', '🎯', '🎲', '🎸', '🐍', '🧠', '🎨', '🎭'];
  
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchedPairs = 0;
  moves = 0;
  score = 0;
  gameStarted = false;
  gameCompleted = false;
  timer = 0;
  private timerInterval: any;
  highScore = 0;
  bestTime = 0;
  
  ngOnInit(): void {
    this.loadHighScores();
    this.initializeGame();
  }
  
  loadHighScores(): void {
    const savedScore = localStorage.getItem('memoryHighScore');
    const savedTime = localStorage.getItem('memoryBestTime');
    this.highScore = savedScore ? parseInt(savedScore, 10) : 0;
    this.bestTime = savedTime ? parseInt(savedTime, 10) : 0;
  }
  
  saveHighScores(): void {
    // Guardar si el puntaje es mayor
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('memoryHighScore', this.highScore.toString());
    }
    // Guardar si el tiempo es menor (y no es 0)
    if ((this.bestTime === 0 || this.timer < this.bestTime) && this.timer > 0) {
      this.bestTime = this.timer;
      localStorage.setItem('memoryBestTime', this.bestTime.toString());
    }
  }
  
  initializeGame(): void {
    // Crear pares de cartas
    const cardPairs: Card[] = [];
    this.emojis.forEach((emoji, index) => {
      // Par 1
      cardPairs.push({
        id: index * 2,
        emoji: emoji,
        isFlipped: false,
        isMatched: false
      });
      // Par 2
      cardPairs.push({
        id: index * 2 + 1,
        emoji: emoji,
        isFlipped: false,
        isMatched: false
      });
    });
    
    // Barajar
    this.cards = this.shuffle(cardPairs);
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.timer = 0;
    this.gameStarted = false;
    this.gameCompleted = false;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  shuffle(array: Card[]): Card[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  startGame(): void {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }
  
  flipCard(card: Card): void {
    // No permitir voltear si:
    // - Ya está volteada
    // - Ya está emparejada
    // - Ya hay 2 cartas volteadas esperando
    // - El juego no ha empezado
    if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2 || !this.gameStarted) {
      return;
    }
    
    // Voltear carta
    card.isFlipped = true;
    this.flippedCards.push(card);
    
    // Si hay 2 cartas volteadas, verificar match
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }
  
  checkMatch(): void {
    const [card1, card2] = this.flippedCards;
    
    if (card1.emoji === card2.emoji) {
      // ¡Match!
      setTimeout(() => {
        card1.isMatched = true;
        card2.isMatched = true;
        this.flippedCards = [];
        this.matchedPairs++;
        
        // Calcular puntaje: base 100 + bonus por velocidad
        const basePoints = 100;
        const timeBonus = Math.max(0, 60 - this.timer);
        const movesBonus = Math.max(0, 20 - this.moves) * 5;
        this.score += basePoints + timeBonus + movesBonus;
        
        // Verificar si ganó
        if (this.matchedPairs === this.emojis.length) {
          this.endGame();
        }
      }, 500);
    } else {
      // No hay match
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
      }, 1000);
    }
  }
  
  endGame(): void {
    this.gameCompleted = true;
    this.gameStarted = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.saveHighScores();
  }
  
  resetGame(): void {
    this.initializeGame();
  }
  
  newGame(): void {
    this.resetGame();
    this.startGame();
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}