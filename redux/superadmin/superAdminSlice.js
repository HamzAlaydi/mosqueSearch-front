import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { rootRoute } from "@/shared/constants/backendLink";

// Async thunks
export const fetchImamRequests = createAsyncThunk(
  "superadmin/fetchImamRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${rootRoute}/superadmin/imam-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch imam requests");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMosquesForAssignment = createAsyncThunk(
  "superadmin/fetchMosquesForAssignment",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${rootRoute}/superadmin/mosques`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch mosques");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveImamRequest = createAsyncThunk(
  "superadmin/approveImamRequest",
  async ({ imamId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${rootRoute}/superadmin/approve-imam/${imamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve imam request");
      }

      const data = await response.json();
      return { imamId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const denyImamRequest = createAsyncThunk(
  "superadmin/denyImamRequest",
  async ({ imamId, reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${rootRoute}/superadmin/deny-imam/${imamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to deny imam request");
      }

      const data = await response.json();
      return { imamId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeImamFromMosque = createAsyncThunk(
  "superadmin/removeImamFromMosque",
  async ({ mosqueId, imamId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${rootRoute}/superadmin/mosque/${mosqueId}/imam/${imamId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove imam from mosque");
      }

      const data = await response.json();
      return { mosqueId, imamId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateImamStatus = createAsyncThunk(
  "superadmin/updateImamStatus",
  async ({ imamId, status, deniedReason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${rootRoute}/superadmin/imam-status/${imamId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, deniedReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update imam status");
      }

      const data = await response.json();
      return { imamId, status, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  imamRequests: [],
  mosques: [],
  loading: false,
  error: null,
  success: null,
};

const superAdminSlice = createSlice({
  name: "superadmin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch imam requests
      .addCase(fetchImamRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImamRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.imamRequests = action.payload;
      })
      .addCase(fetchImamRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch mosques
      .addCase(fetchMosquesForAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMosquesForAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.mosques = action.payload;
      })
      .addCase(fetchMosquesForAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve imam request
      .addCase(approveImamRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveImamRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.data.message;
        // Update the imam request status
        const index = state.imamRequests.findIndex(
          (req) => req.id === action.payload.imamId
        );
        if (index !== -1) {
          state.imamRequests[index].status = "approved";
        }
      })
      .addCase(approveImamRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deny imam request
      .addCase(denyImamRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(denyImamRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.data.message;
        // Update the imam request status
        const index = state.imamRequests.findIndex(
          (req) => req.id === action.payload.imamId
        );
        if (index !== -1) {
          state.imamRequests[index].status = "denied";
        }
      })
      .addCase(denyImamRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove imam from mosque
      .addCase(removeImamFromMosque.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeImamFromMosque.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.data.message;
      })
      .addCase(removeImamFromMosque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update imam status
      .addCase(updateImamStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateImamStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.data.message;
        // Update the imam request status
        const index = state.imamRequests.findIndex(
          (req) => req.id === action.payload.imamId
        );
        if (index !== -1) {
          state.imamRequests[index].status = action.payload.status;
        }
      })
      .addCase(updateImamStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = superAdminSlice.actions;
export default superAdminSlice.reducer;
