import { combineReducers, applyMiddleware } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import { authReducer } from './reducers/authReducer';
import {messengerReducer} from './reducers/messengerReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  messenger : messengerReducer
});

const middleware = [thunkMiddleware];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware)
  //devTools: process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});

export default store;
