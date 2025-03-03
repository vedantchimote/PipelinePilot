import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import pipelineReducer from './pipelineSlice';
import uiReducer from './uiSlice';
import templatesReducer from './templatesSlice';
import persistenceReducer from './persistenceSlice';

export const store = configureStore({
  reducer: {
    pipeline: pipelineReducer,
    ui: uiReducer,
    templates: templatesReducer,
    persistence: persistenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['pipeline/importYAML'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
