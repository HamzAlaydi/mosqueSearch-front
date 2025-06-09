// redux/block/blockSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootRoute } from "../../shared/constants/backendLink";

// Async thunks
export const blockUser = createAsyncThunk(
  "block/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/blocks/block`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user"
      );
    }
  }
);

export const unblockUser = createAsyncThunk(
  "block/unblockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/blocks/unblock`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user"
      );
    }
  }
);

export const fetchBlockedUsers = createAsyncThunk(
  "block/fetchBlockedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/blocks/blocked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blocked users"
      );
    }
  }
);

const initialState = {
  blockedUsers: [],
  loading: false,
  error: null,
  blockingUserId: null, // Track which user is being blocked/unblocked
};

const blockSlice = createSlice({
  name: "block",
  initialState,
  reducers: {
    clearBlockError: (state) => {
      state.error = null;
    },
    // Local actions for optimistic updates
    blockUserLocal: (state, action) => {
      const userId = action.payload;
      if (!state.blockedUsers.some((user) => user._id === userId)) {
        state.blockedUsers.push({ _id: userId });
      }
    },
    unblockUserLocal: (state, action) => {
      const userId = action.payload;
      state.blockedUsers = state.blockedUsers.filter(
        (user) => user._id !== userId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Block user
      .addCase(blockUser.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.blockingUserId = action.meta.arg;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.blockingUserId = null;
        const { userId } = action.payload;
        if (!state.blockedUsers.some((user) => user._id === userId)) {
          state.blockedUsers.push({ _id: userId });
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blockingUserId = null;
      })

      // Unblock user
      .addCase(unblockUser.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.blockingUserId = action.meta.arg;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.blockingUserId = null;
        const { userId } = action.payload;
        state.blockedUsers = state.blockedUsers.filter(
          (user) => user._id !== userId
        );
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blockingUserId = null;
      })

      // Fetch blocked users
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedUsers = action.payload;
      })
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBlockError, blockUserLocal, unblockUserLocal } =
  blockSlice.actions;

export default blockSlice.reducer;
