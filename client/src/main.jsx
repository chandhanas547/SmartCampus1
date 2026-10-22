import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  createElement(StrictMode, null, createElement(App)),
);

// Local verification only; Vite removes this branch from the production build.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('audit')) import('./audit.js');
