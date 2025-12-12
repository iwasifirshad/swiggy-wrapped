import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import the CSS file so Vite bundles it

// This file serves as the Content Script entry point.

const MOUNT_POINT_ID = 'swiggy-wrapped-extension-root';

const init = () => {
  // Only initialize if we're on the /ex page
  if (!window.location.href.includes('/ex')) {
    return;
  }

  // Check if we are already injected
  if (document.getElementById(MOUNT_POINT_ID)) return;

  // Create a container for our extension
  const container = document.createElement('div');
  container.id = MOUNT_POINT_ID;
  
  // Note: All styles are handled in index.css
  // Inline styles for critical properties
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '99999';
  container.style.pointerEvents = 'none'; // Critical: allows clicking through to Swiggy
  container.style.background = 'transparent';
  container.style.overflow = 'hidden';
  
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// If we are running in development with a root element
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // We are likely in the content script environment
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}