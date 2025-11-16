import type { AppConfig } from '../core/config';
import type { AppState } from '../core/state';
import { clamp } from '../utils/math';

export interface VirtualCursor {
  element: HTMLElement;
  moveRelative(dx: number, dy: number): void;
  moveTo(x: number, y: number): void;
  click(type: 'CLICK' | 'DOUBLE_CLICK' | 'RIGHT_CLICK'): void;
  getPosition(): { x: number; y: number };
}

export function createVirtualCursor(
  desktop: HTMLElement,
  state: AppState,
  config: AppConfig
): VirtualCursor {
  const cursor = document.createElement('div');
  cursor.className = 'virtual-cursor';
  desktop.appendChild(cursor);

  function updatePosition(x: number, y: number) {
    state.cursor.x = clamp(x, 0, config.desktopWidth);
    state.cursor.y = clamp(y, 0, config.desktopHeight);
    cursor.style.left = `${state.cursor.x}px`;
    cursor.style.top = `${state.cursor.y}px`;
  }

  function moveRelative(dx: number, dy: number) {
    updatePosition(state.cursor.x + dx, state.cursor.y + dy);
  }

  function moveTo(x: number, y: number) {
    updatePosition(x, y);
  }

  function click(type: 'CLICK' | 'DOUBLE_CLICK' | 'RIGHT_CLICK') {
    cursor.animate(
      [
        { transform: 'scale(1)', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.6))' },
        { transform: 'scale(0.9)', filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))' },
        { transform: 'scale(1)', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.6))' }
      ],
      {
        duration: type === 'DOUBLE_CLICK' ? 240 : 160,
        iterations: type === 'DOUBLE_CLICK' ? 2 : 1
      }
    );
  }

  updatePosition(state.cursor.x, state.cursor.y);

  return {
    element: cursor,
    moveRelative,
    moveTo,
    click,
    getPosition: () => ({ ...state.cursor })
  };
}
