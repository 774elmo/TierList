import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // <-- import BrowserRouter
import App from './app.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>   {/* <-- Wrap here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
