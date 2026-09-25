import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCoreMedia } from './utils/mediaPreloader';

// Initialize immediate background preloading for instant video display
preloadCoreMedia();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
