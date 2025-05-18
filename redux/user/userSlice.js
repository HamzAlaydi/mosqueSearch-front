// userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootRoute } from "../../shared/constants/backendLink";

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
  "users/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);
export const fetchMyProfile = createAsyncThunk(
  "users/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${rootRoute}/users/profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user profile"
      );
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  "users/updateProfilePicture",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${rootRoute}/users/profile/picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile picture"
      );
    }
  }
);

export const requestUnblurPicture = createAsyncThunk(
  "users/requestUnblurPicture",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/users/profile/picture/unblur`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request unblur"
      );
    }
  }
);

const initialState = {
  currentUser: null,
  viewingUser: null,
  loading: false,
  pictureLoading: false,
  error: null,
  success: null,
  unblurRequest: {
    loading: false,
    success: false,
    error: null,
  },
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearViewingUser: (state) => {
      state.viewingUser = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.success = "Profile updated successfully";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateProfilePicture
      .addCase(updateProfilePicture.pending, (state) => {
        state.pictureLoading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.pictureLoading = false;
        if (state.currentUser) {
          state.currentUser.profilePicture = action.payload.profilePicture;
        }
        state.success = "Profile picture updated successfully";
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.pictureLoading = false;
        state.error = action.payload;
      })

      // Handle requestUnblurPicture
      .addCase(requestUnblurPicture.pending, (state) => {
        state.unblurRequest.loading = true;
        state.unblurRequest.error = null;
      })
      .addCase(requestUnblurPicture.fulfilled, (state) => {
        state.unblurRequest.loading = false;
        state.unblurRequest.success = true;
        if (state.currentUser) {
          state.currentUser.unblurRequest = true;
        }
      })
      .addCase(requestUnblurPicture.rejected, (state, action) => {
        state.unblurRequest.loading = false;
        state.unblurRequest.error = action.payload;
      });
  },
});

export const { setCurrentUser, clearViewingUser, clearSuccess, clearError } =
  userSlice.actions;

export default userSlice.reducer;
