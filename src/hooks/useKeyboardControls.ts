import { useEffect, useCallback, useState } from 'react';

export function useKeyboardControls() {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        setControls(controls => ({ ...controls, forward: true }));
        break;
      case 'KeyS':
        setControls(controls => ({ ...controls, backward: true }));
        break;
      case 'KeyA':
        setControls(controls => ({ ...controls, left: true }));
        break;
      case 'KeyD':
        setControls(controls => ({ ...controls, right: true }));
        break;
      case 'Space':
        setControls(controls => ({ ...controls, jump: true }));
        break;
      case 'ShiftLeft':
        setControls(controls => ({ ...controls, sprint: true }));
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        setControls(controls => ({ ...controls, forward: false }));
        break;
      case 'KeyS':
        setControls(controls => ({ ...controls, backward: false }));
        break;
      case 'KeyA':
        setControls(controls => ({ ...controls, left: false }));
        break;
      case 'KeyD':
        setControls(controls => ({ ...controls, right: false }));
        break;
      case 'Space':
        setControls(controls => ({ ...controls, jump: false }));
        break;
      case 'ShiftLeft':
        setControls(controls => ({ ...controls, sprint: false }));
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return controls;
} 