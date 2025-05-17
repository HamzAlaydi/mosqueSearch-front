import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootRoute } from "../../shared/constants/backendLink";

// Async thunks
export const fetchMatches = createAsyncThunk(
  "matches/fetchMatches",
  async (distance, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${rootRoute}/matches/search?distance=${distance}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

export const fetchMatchesByMosque = createAsyncThunk(
  "matches/fetchMatchesByMosque",
  async (mosqueId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${rootRoute}/matches/mosque/${mosqueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch mosque matches"
      );
    }
  }
);

export const addInterest = createAsyncThunk(
  "matches/addInterest",
  async (femaleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/interests/add`,
        { femaleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return femaleId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add interest"
      );
    }
  }
);

export const removeInterest = createAsyncThunk(
  "matches/removeInterest",
  async (femaleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/interests/remove`,
        { femaleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return femaleId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove interest"
      );
    }
  }
);

export const fetchUserInterests = createAsyncThunk(
  "matches/fetchUserInterests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/interests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch interests"
      );
    }
  }
);

const initialState = {
  matches: [],
  selectedMatch: null,
  loading: false,
  error: null,
  searchDistance: 20, // Default 20 miles
  userInterests: [],
};

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setSelectedMatch: (state, action) => {
      state.selectedMatch = action.payload;
    },
    setSearchDistance: (state, action) => {
      state.searchDistance = action.payload;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.selectedMatch = null;
    },
    addInterestLocal: (state, action) => {
      if (
        !state.userInterests.some((item) => item._id === action.payload._id)
      ) {
        state.userInterests.push(action.payload);
      }
    },
    removeInterestLocal: (state, action) => {
      state.userInterests = state.userInterests.filter(
        (item) => item._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
        state.loading = false;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMatchesByMosque.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchesByMosque.fulfilled, (state, action) => {
        state.matches = action.payload;
        state.loading = false;
      })
      .addCase(fetchMatchesByMosque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserInterests.fulfilled, (state, action) => {
        state.userInterests = action.payload;
      })
      .addCase(addInterest.fulfilled, (state, action) => {
        state.userInterests.push(action.payload);
      })
      .addCase(removeInterest.fulfilled, (state, action) => {
        state.userInterests = state.userInterests.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export const {
  setSelectedMatch,
  setSearchDistance,
  clearMatches,
  addInterestLocal,
  removeInterestLocal,
} = matchSlice.actions;

export default matchSlice.reducer;
