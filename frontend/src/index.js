import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; 
import './main.scss';
import { Provider } from 'react-redux';
import store from './store/index.js';

import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import alertTemplate from 'react-alert-template-basic';

const options = {
  timeout: 5000,
  position: positions.BOTTOM_CENTER,
  transition: transitions.SCALE,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AlertProvider template={alertTemplate} {...options}>
      <App />
    </AlertProvider>
  </Provider>
);
