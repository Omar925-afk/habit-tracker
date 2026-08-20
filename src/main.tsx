// React is provided by the project runtime; suppress the diagnostic when dependencies are not installed.
// @ts-ignore
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runAllTests } from './services/tests';
// The stylesheet is handled by the bundler; TypeScript has no declaration for CSS imports.
// @ts-ignore
import '../styles/globals.css';

// Run core tests in development
if (import.meta.env.DEV) {
  runAllTests();
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
