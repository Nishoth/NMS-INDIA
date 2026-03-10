import { configureStore } from '@reduxjs/toolkit';
import caseReducer from './slices/caseSlice';

export const store = configureStore({
    reducer: {
        cases: caseReducer,
    },
});

export default store;
