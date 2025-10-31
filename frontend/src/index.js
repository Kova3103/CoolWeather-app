import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create a root for rendering the React application, targeting the DOM element with id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
// Render the App component wrapped in StrictMode for additional development checks and warnings
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
