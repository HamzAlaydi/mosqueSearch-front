import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { rootRoute } from "../../shared/constants/backendLink";

// Helper to build query string from filters
const buildFilterQueryString = (filters) => {
  const queryParts = [];

  // Add distance parameter
  if (filters.distance) {
    queryParts.push(`distance=${filters.distance}`);
  }

  // Add age range if present
  if (filters.ageRange?.min) {
    queryParts.push(`minAge=${filters.ageRange.min}`);
  }
  if (filters.ageRange?.max) {
    queryParts.push(`maxAge=${filters.ageRange.max}`);
  }

  // Add array-based filters
  const arrayFilters = [
    "religiousness",
    "maritalStatus",
    "hasChildren",
    "childrenDesire",
    "educationLevel",
    "profession",
  ];

  arrayFilters.forEach((filter) => {
    if (filters[filter]?.length > 0) {
      queryParts.push(`${filter}=${filters[filter].join(",")}`);
    }
  });

  // Add boolean filters
  if (
    filters.willingToRelocate !== null &&
    filters.willingToRelocate !== undefined
  ) {
    queryParts.push(`willingToRelocate=${filters.willingToRelocate}`);
  }

  // Add pagination
  if (filters.page) {
    queryParts.push(`page=${filters.page}`);
  }

  if (filters.limit) {
    queryParts.push(`limit=${filters.limit}`);
  }

  return queryParts.join("&");
};
// Async thunks
export const fetchMatches = createAsyncThunk(
  "matches/fetchMatches",
  async ({ filters }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build query string from all filter parameters
      const queryString = buildFilterQueryString({
        ...filters,
        page: 1,
        limit: 10,
      });

      const response = await axios.get(
        `${rootRoute}/matches/search?${queryString}`,
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

export const loadMoreMatches = createAsyncThunk(
  "matches/loadMoreMatches",
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        matches: { activeFilters, page },
      } = getState();

      const token = localStorage.getItem("token");

      // Build query string from all active filters
      const queryString = buildFilterQueryString({
        ...activeFilters,
        page: page + 1,
        limit: 10,
      });

      const response = await axios.get(
        `${rootRoute}/matches/search?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load more matches"
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
  activeFilters: {
    prayer: [],
    facilities: [],
    rating: null,
    distance: 20,
    religiousness: [],
    maritalStatus: [],
    ageRange: { min: 18, max: 65 },
    hasChildren: [],
    childrenDesire: [],
    educationLevel: [],
    profession: [],
    willingToRelocate: null,
  },
  userInterests: [],
  page: 1,
  hasMore: true,
};

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setSelectedMatch: (state, action) => {
      state.selectedMatch = action.payload;
    },
    setSearchDistance: (state, action) => {
      state.activeFilters.distance = action.payload;
      state.page = 1; // Reset pagination when distance changes
      state.hasMore = true;
    },
    updateFilters: (state, action) => {
      const { category, value } = action.payload;

      if (category === "ageRange") {
        state.activeFilters.ageRange = value;
      } else if (
        [
          "religiousness",
          "maritalStatus",
          "hasChildren",
          "childrenDesire",
          "educationLevel",
          "profession",
        ].includes(category)
      ) {
        // For array filters, toggle value
        const currentIndex = state.activeFilters[category].indexOf(value);
        if (currentIndex === -1) {
          state.activeFilters[category].push(value);
        } else {
          state.activeFilters[category].splice(currentIndex, 1);
        }
      } else if (category === "willingToRelocate") {
        state.activeFilters.willingToRelocate = value;
      } else {
        state.activeFilters[category] = value;
      }

      // Reset pagination when filters change
      state.page = 1;
      state.hasMore = true;
      state.matches = [];
    },
    removeFilter: (state, action) => {
      const { category, value } = action.payload;

      if (category === "ageRange") {
        state.activeFilters.ageRange = { min: 18, max: 65 };
      } else if (
        [
          "religiousness",
          "maritalStatus",
          "hasChildren",
          "childrenDesire",
          "educationLevel",
          "profession",
        ].includes(category)
      ) {
        state.activeFilters[category] = state.activeFilters[category].filter(
          (item) => item !== value
        );
      } else if (category === "willingToRelocate") {
        state.activeFilters.willingToRelocate = null;
      } else {
        state.activeFilters[category] = initialState.activeFilters[category];
      }

      // Reset pagination when filters change
      state.page = 1;
      state.hasMore = true;
    },
    clearAllFilters: (state) => {
      state.activeFilters = {
        ...initialState.activeFilters,
        distance: state.activeFilters.distance, // Keep the current distance
      };
      state.page = 1;
      state.hasMore = true;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.selectedMatch = null;
      state.page = 1;
      state.hasMore = true;
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
        state.page = 1;
        state.hasMore = true;
        state.isFirstLoad = true; // Set isFirstLoad to true on initial fetch
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        const matchesData = Array.isArray(action.payload) ? action.payload : [];
        state.matches = matchesData;
        state.loading = false;
        state.hasMore = matchesData.length === 10; // If we got less than 10 items, there are no more to fetch
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadMoreMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isFirstLoad = false; // Set isFirstLoad to false on pagination
      })
      .addCase(loadMoreMatches.fulfilled, (state, action) => {
        const newMatches = Array.isArray(action.payload) ? action.payload : [];
        state.matches = [...state.matches, ...newMatches];
        state.loading = false;
        state.page += 1;
        state.hasMore = newMatches.length === 10; // If we got less than 10 items, there are no more to fetch
      })
      .addCase(loadMoreMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasMore = false; // Stop trying to load more on error
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
  updateFilters,
  removeFilter,
  clearAllFilters,
  clearMatches,
  addInterestLocal,
  removeInterestLocal,
} = matchSlice.actions;

export default matchSlice.reducer;
