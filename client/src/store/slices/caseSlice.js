import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../hooks/useApi';

export const fetchCaseDetail = createAsyncThunk(
    'cases/fetchCaseDetail',
    async (caseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cases/${caseId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

export const createDynamicNotice = createAsyncThunk(
    'cases/createDynamicNotice',
    async (noticeData, { rejectWithValue }) => {
        try {
            const response = await api.post('/notices/', noticeData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

const caseSlice = createSlice({
    name: 'cases',
    initialState: {
        currentCase: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentCase: (state) => {
            state.currentCase = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCaseDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCaseDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCase = action.payload;
            })
            .addCase(fetchCaseDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createDynamicNotice.fulfilled, (state, action) => {
                if (state.currentCase && state.currentCase.id === action.payload.case_id) {
                    if (!state.currentCase.notices) state.currentCase.notices = [];
                    state.currentCase.notices.push(action.payload);
                }
            });
    },
});

export const { clearCurrentCase } = caseSlice.actions;
export default caseSlice.reducer;
