import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'cyberui-2045/styles.css';
// After the library's stylesheet, and the only file that sets the accent
// (see theme/violet.css). App.css is imported by App.tsx, after this.
import './theme/violet.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
