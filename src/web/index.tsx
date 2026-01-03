/**
 * Widget Entry Point
 * 
 * Renders the Splitwise widget into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Widget from './Widget';
import './styles.css';

// Find or create widget container
let container = document.getElementById('splitwise-widget-root');

if (!container) {
  container = document.createElement('div');
  container.id = 'splitwise-widget-root';
  document.body.appendChild(container);
}

// Render widget
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Widget />
  </React.StrictMode>
);

// Export for external access if needed
export { Widget };
