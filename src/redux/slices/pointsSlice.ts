import {createAction, createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";

export interface Point2DRow {
    id: number;
    x: number;
    y: number;
    R: number;
    inArea: boolean;
    executionTime: number;
    timestamp: string; // ISO или формат "dd-MM-yyyy HH:mm:ss"
    username: string;
}

interface PointsState {
    data: Point2DRow[];
    loading: boolean;
    error: string | null;
}

const initialState: PointsState = {
    data: [],
    loading: false,
    error: null,
};

export const addOptimisticPoint = createAction<Point2DRow>('points/addOptimisticPoint');
export const removeOptimisticPoint = createAction<number>('points/removeOptimisticPoint'); // id

export const fetchAllPoints = createAsyncThunk<Point2DRow[], string>(
    'points/fetchAll',
    async (token, { rejectWithValue }) => {
        try {
            const res = await fetch('https://itmo.ssngn.ru/lab4/api/point/all', {
                headers: { snAuthToken: token },
            });
            if (!res.ok) throw new Error('Failed to fetch points');
            const json = await res.json();
            return json.data || [];
        } catch (err: any) {
            return rejectWithValue(err.message || 'Unknown error');
        }
    }
);

export const fetchMyPoints = createAsyncThunk<Point2DRow[], string>(
    'points/fetchMy',
    async (token, { rejectWithValue }) => {
        try {
            const res = await fetch('https://itmo.ssngn.ru/lab4/api/point/my', {
                headers: { snAuthToken: token },
            });
            if (!res.ok) throw new Error('Failed to fetch my points');
            const json = await res.json();
            return json.data || [];
        } catch (err: any) {
            return rejectWithValue(err.message || 'Unknown error');
        }
    }
);

export const deletePoint = createAsyncThunk<void, { id: number; token: string }>(
    'points/deletePoint',
    async ({ id, token }, { rejectWithValue }) => {
        try {
            const res = await fetch(`https://itmo.ssngn.ru/lab4/api/point/${id}`, {
                method: 'DELETE',
                headers: { snAuthToken: token },
            });
            if (!res.ok) throw new Error('Failed to delete point');
        } catch (err: any) {
            return rejectWithValue(err.message || 'Unknown error');
        }
    }
);

export const deleteAllMyPoints = createAsyncThunk<void, string>(
    'points/deleteAllMy',
    async (token, { rejectWithValue }) => {
        try {
            const res = await fetch('https://itmo.ssngn.ru/lab4/api/point/my', {
                method: 'DELETE',
                headers: { snAuthToken: token },
            });
            if (!res.ok) throw new Error('Failed to delete all points');
        } catch (err: any) {
            return rejectWithValue(err.message || 'Unknown error');
        }
    }
);

const pointsSlice = createSlice({
    name: 'points',
    initialState,
    reducers: {
        updateFromWebSocket: (state, action: PayloadAction<Point2DRow[]>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        addOptimisticPoint: (state, action: PayloadAction<Point2DRow>) => {
            state.data.unshift(action.payload);
        },
        removeOptimisticPoint: (state, action: PayloadAction<number>) => {
            state.data = state.data.filter(p => p.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPoints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPoints.fulfilled, (state, action: PayloadAction<Point2DRow[]>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAllPoints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to load points';
            })

            // .addCase(deletePoint.fulfilled, (state, action) => {})
        ;
    },
});

export default pointsSlice.reducer;
