import { useEffect } from 'react';
import { inputStore } from '../store/inputStore';

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = inputStore.getState();
      state.keys.add(e.code);
      if (e.code === 'Space') {
        inputStore.setState({ shooting: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = inputStore.getState();
      state.keys.delete(e.code);
      if (e.code === 'Space') {
        inputStore.setState({ shooting: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
