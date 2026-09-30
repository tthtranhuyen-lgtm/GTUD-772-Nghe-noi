// Ensure window.fetch has both getter and setter in iframe environments
try {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    let currentFetch = originalFetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return currentFetch;
      },
      set(fn) {
        currentFetch = fn;
      },
      configurable: true,
      enumerable: true
    });
  }
} catch (_) {
  // Ignore if already patched
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
