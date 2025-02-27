import { ControlState } from '../game/types';

export class Controls {
  private state: ControlState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    turnLeft: false,
    turnRight: false
  };

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW': this.state.forward = true; break;
      case 'KeyS': this.state.backward = true; break;
      case 'KeyA': this.state.left = true; break;
      case 'KeyD': this.state.right = true; break;
      case 'Space': this.state.jump = true; break;
      case 'ShiftLeft': this.state.sprint = true; break;
      case 'ArrowLeft': this.state.turnLeft = true; break;
      case 'ArrowRight': this.state.turnRight = true; break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW': this.state.forward = false; break;
      case 'KeyS': this.state.backward = false; break;
      case 'KeyA': this.state.left = false; break;
      case 'KeyD': this.state.right = false; break;
      case 'Space': this.state.jump = false; break;
      case 'ShiftLeft': this.state.sprint = false; break;
      case 'ArrowLeft': this.state.turnLeft = false; break;
      case 'ArrowRight': this.state.turnRight = false; break;
    }
  }

  getState(): ControlState {
    return { ...this.state };
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
} 