 
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './services/baseApi';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    // Add RTK Query reducer
    [baseApi.reducerPath]: baseApi.reducer,
    // Add regular slice reducers
    auth: authReducer,
   chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;