import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake-game',
  imports: [NgClass, NgStyle],
  templateUrl: './snake-game.html',
  styleUrl: './snake-game.scss'
})
export class SnakeGame implements OnInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Configuración del juego
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private readonly GRID_SIZE = 20;
  private readonly CELL_SIZE = 20;
  private readonly CANVAS_SIZE = this.GRID_SIZE * this.CELL_SIZE;
  
  // Estado del juego
  snake: Position[] = [{ x: 10, y: 10 }];
  food: Position = { x: 15, y: 15 };
  direction: Position = { x: 0, y: 0 };
  nextDirection: Position = { x: 0, y: 0 };
  gameRunning = false;
  gameOver = false;
  score = 0;
  highScore = 0;
  
  private gameLoop!: any;
  private gameSpeed = 100; // ms entre movimientos
  
  ngOnInit(): void {
    this.loadHighScore();
  }
  
  ngOnDestroy(): void {
    this.stopGame();
  }
  
  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.canvas.width = this.CANVAS_SIZE;
    this.canvas.height = this.CANVAS_SIZE;
    this.ctx = this.canvas.getContext('2d')!;
    this.draw();
  }
  
  loadHighScore(): void {
    const saved = localStorage.getItem('snakeHighScore');
    this.highScore = saved ? parseInt(saved, 10) : 0;
  }
  
  saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
  }
  
  startGame(): void {
    if (this.gameRunning) return;
    
    this.resetGame();
    this.gameRunning = true;
    this.gameOver = false;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
  }
  
  stopGame(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.gameRunning = false;
  }
  
  resetGame(): void {
    this.stopGame();
    this.snake = [{ x: 10, y: 10 }];
    this.food = this.generateFood();
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.gameRunning = false;
    this.draw();
  }
  
  generateFood(): Position {
    let food: Position;
    do {
      food = {
        x: Math.floor(Math.random() * this.GRID_SIZE),
        y: Math.floor(Math.random() * this.GRID_SIZE)
      };
    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.gameRunning && !this.gameOver && event.key === ' ') {
      this.startGame();
      return;
    }
    
    if (this.gameOver && event.key === ' ') {
      this.resetGame();
      this.startGame();
      return;
    }
    
    if (!this.gameRunning) return;
    
    // Prevenir movimiento en dirección opuesta
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
        }
        break;
    }
  }
  
  update(): void {
    if (!this.gameRunning || this.gameOver) return;
    
    // Actualizar dirección
    this.direction = { ...this.nextDirection };
    
    if (this.direction.x === 0 && this.direction.y === 0) return;
    
    // Calcular nueva posición de la cabeza
    const head = this.snake[0];
    const newHead: Position = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };
    
    // Verificar colisión con paredes
    if (newHead.x < 0 || newHead.x >= this.GRID_SIZE || newHead.y < 0 || newHead.y >= this.GRID_SIZE) {
      this.endGame();
      return;
    }
    
    // Verificar colisión con sí misma
    if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      this.endGame();
      return;
    }
    
    // Añadir nueva cabeza
    this.snake.unshift(newHead);
    
    // Verificar si comió la comida
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.food = this.generateFood();
      // Aumentar velocidad cada 50 puntos
      if (this.score % 50 === 0 && this.gameSpeed > 50) {
        this.gameSpeed -= 10;
        this.stopGame();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
      }
    } else {
      // Remover cola si no comió
      this.snake.pop();
    }
    
    this.draw();
  }
  
  endGame(): void {
    this.gameOver = true;
    this.gameRunning = false;
    this.saveHighScore();
    this.stopGame();
  }
  
  draw(): void {
    // Limpiar canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);
    
    // Dibujar cuadrícula sutil
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.CELL_SIZE, 0);
      this.ctx.lineTo(i * this.CELL_SIZE, this.CANVAS_SIZE);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.CELL_SIZE);
      this.ctx.lineTo(this.CANVAS_SIZE, i * this.CELL_SIZE);
      this.ctx.stroke();
    }
    
    // Dibujar comida
    this.drawCell(this.food.x, this.food.y, '#ff6b6b', true);
    
    // Dibujar serpiente
    this.snake.forEach((segment, index) => {
      const color = index === 0 
        ? '#4ecdc4' // Cabeza
        : `hsl(168, ${70 - index * 2}%, ${50 + index}%)`; // Cuerpo con degradado
      this.drawCell(segment.x, segment.y, color, false);
    });
  }
  
  drawCell(x: number, y: number, color: string, isFood: boolean): void {
    const cx = x * this.CELL_SIZE;
    const cy = y * this.CELL_SIZE;
    const padding = 1;
    
    // Sombra/glow
    if (isFood || x === this.snake[0]?.x && y === this.snake[0]?.y) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    // Celda
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.roundRect(
      cx + padding, 
      cy + padding, 
      this.CELL_SIZE - padding * 2, 
      this.CELL_SIZE - padding * 2, 
      4
    );
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }
  
  roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}