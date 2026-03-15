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

export const createMeeting = createAsyncThunk(
    'cases/createMeeting',
    async (meetingData, { rejectWithValue }) => {
        try {
            const response = await api.post('/meetings/', meetingData);
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
        updateNoticeStatusLocal: (state, action) => {
            const { noticeId, status, error_message, delivery_status, delivery_channels } = action.payload;
            if (state.currentCase && state.currentCase.notices) {
                const notice = state.currentCase.notices.find(n => n.id === noticeId);
                if (notice) {
                    notice.status = status;
                    if (error_message) {
                        notice.error_message = error_message;
                    }
                    if (delivery_status) {
                        notice.delivery_status = delivery_status;
                    }
                    if (delivery_channels) {
                        notice.delivery_channels = delivery_channels;
                    }
                }
            }
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
            })
            .addCase(createMeeting.fulfilled, (state, action) => {
                if (state.currentCase && state.currentCase.id === action.payload.case_id) {
                    if (!state.currentCase.meetings) state.currentCase.meetings = [];
                    state.currentCase.meetings.push(action.payload);
                }
            });
    },
});

export const { clearCurrentCase, updateNoticeStatusLocal } = caseSlice.actions;
export default caseSlice.reducer;
