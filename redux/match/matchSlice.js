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

  // Add selected mosque IDs to the query string if in professional mode and selectedMosques exist
  // This is a correction: The backend /matches/search should filter by these if present,
  // but if we are in 'mosque' mode, the dedicated /matches/mosque endpoint is used.
  // So, the below is generally for professional search if it supported multi-mosque filtering.
  // For the current setup, multi-mosque searching in 'mosque' mode is handled by dispatching fetchMatchesByMosque for each.
  // If your /matches/search API supported a 'mosqueIds' parameter, you could include it here.
  // For now, we assume this buildFilterQueryString is primarily for /matches/search without specific mosque IDs for professional search.

  // If you *did* want to filter professional matches by multiple selected mosques via a single API call:
  // if (filters.selectedMosques && filters.selectedMosques.length > 0) {
  //   const mosqueIds = filters.selectedMosques.map(m => m.id).join(',');
  //   queryParts.push(`mosqueIds=${mosqueIds}`);
  // }

  return queryParts.join("&");
};

// Async thunks
export const initializeUserMosques = createAsyncThunk(
  "matches/initializeUserMosques",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Extract attached mosques from user profile
      const attachedMosques = response.data.attachedMosques || [];
      return attachedMosques.map((mosque) => ({
        id: mosque.id,
        name: mosque.name,
        isDefault: true, // Mark as default/attached mosque
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user mosques"
      );
    }
  }
);
export const fetchMatches = createAsyncThunk(
  "matches/fetchMatches",
  async ({ filters, center }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build query string from all filter parameters
      const queryString = buildFilterQueryString({
        ...filters,
        page: 1, // Always reset page for a new fetchMatches
        limit: 10,
        // Potentially add mapCenter coordinates if your backend API uses them for distance search
        // e.g., latitude: center?.lat, longitude: center?.lng
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
  async ({ mosqueId, mosqueName }, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState();
      const activeFilters = state.matches.activeFilters;

      // Build query string from all filter parameters (same as professional mode)
      const queryString = buildFilterQueryString({
        ...activeFilters,
        page: 1,
        limit: 10,
      });

      const response = await fetch(
        `${rootRoute}/matches/mosque/${mosqueId}?${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch matches by mosque");
      }

      const data = await response.json();
      return {
        // Ensure data is an array, or an object containing an array.
        // If your API directly returns an array of users for a mosque: data
        // If it returns { users: [], count: X }: data.users
        matches: data.matches || data.users || data, // Adjust based on your API response structure
        mosqueId,
        mosqueName,
      };
    } catch (error) {
      return rejectWithValue(error.message);
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
export const saveMosqueFilters = createAsyncThunk(
  "matches/saveMosqueFilters",
  async (selectedMosques, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${rootRoute}/matches/save-mosques`,
        { selectedMosques },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return selectedMosques;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save mosque selection"
      );
    }
  }
);

export const loadMosqueFilters = createAsyncThunk(
  "matches/loadMosqueFilters",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/matches/saved-mosques`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.savedMosques || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load saved mosques"
      );
    }
  }
);

const initialState = {
  matches: [], // The currently displayed matches (can be professional or mosque-based)
  professionalMatches: [], // Stores professional search results
  MosqueZawajes: [], // Stores aggregated results for selected mosques
  selectedMatch: null,
  loading: false,
  error: null,
  hasSavedFilters: false,
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
    // selectedMosque: null, // This single property is being replaced by selectedMosques array
    selectedMosques: [], // Array to hold { id, name } of selected mosques
  },
  userInterests: [],
  page: 1, // for professional search pagination
  hasMore: true, // for professional search pagination
  searchedMosques: [], // Track which mosques have been searched (for caching/optimization, though not strictly used for direct data display)
  searchMode: "mosque", // 'professional' or 'mosque' - new state to explicitly track current mode
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
      // When distance changes, we effectively need to re-fetch professional matches
      if (state.searchMode === "professional") {
        state.matches = []; // Clear current display
        state.professionalMatches = []; // Clear stored professional matches to force re-fetch
      }
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
        const currentIndex = state.activeFilters[category].indexOf(value);
        if (currentIndex === -1) {
          state.activeFilters[category].push(value);
        } else {
          state.activeFilters[category].splice(currentIndex, 1);
        }
      } else if (category === "willingToRelocate") {
        state.activeFilters.willingToRelocate = value;
      } else if (category === "selectedMosques") {
        // Handle adding/removing mosques from the selectedMosques array
        const existingMosqueIndex =
          state.activeFilters.selectedMosques.findIndex(
            (m) => m.id === value.id
          );
        if (existingMosqueIndex === -1) {
          // Add new mosque if not already present
          state.activeFilters.selectedMosques.push(value);
        } else {
          // Remove mosque if it's already present (toggle behavior)
          state.activeFilters.selectedMosques.splice(existingMosqueIndex, 1);
        }
        // When selected mosques change, clear current mosque matches to trigger refetch for all selected.
        state.MosqueZawajes = [];
        if (state.searchMode === "mosque") {
          state.matches = [];
        }
      }

      // Reset pagination for professional search when *any* filter changes
      state.page = 1;
      state.hasMore = true;
      // If filters change in professional mode, clear displayed matches and professional matches to force re-fetch
      if (
        state.searchMode === "professional" &&
        category !== "selectedMosques" // Don't clear professional matches when selectedMosques array changes if still in professional mode
      ) {
        state.matches = [];
        state.professionalMatches = [];
      }
    },
    removeFilter: (state, action) => {
      const { category, value } = action.payload; // value will be the actual item or ID to remove

      if (category === "ageRange") {
        state.activeFilters.ageRange = { min: 18, max: 65 };
      } else if (category === "selectedMosques") {
        // `value` here is the mosque ID to remove
        state.activeFilters.selectedMosques =
          state.activeFilters.selectedMosques.filter(
            (mosque) => mosque.id !== value
          );
        // Remove from MosqueZawajes too - filter out matches from this mosque
        state.MosqueZawajes = state.MosqueZawajes.filter(
          (match) => !match.mosqueId || match.mosqueId !== value
        );
        if (state.searchMode === "mosque") {
          state.matches = [...state.MosqueZawajes];
        }
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
      } else if (category === "distance") {
        // Explicitly handle distance if you remove it to default
        state.activeFilters.distance = initialState.activeFilters.distance;
      }

      state.page = 1;
      state.hasMore = true;
      // If filters change in professional mode, clear displayed matches and professional matches to force re-fetch
      if (state.searchMode === "professional") {
        state.matches = [];
        state.professionalMatches = [];
      }
    },
    clearAllFilters: (state) => {
      state.activeFilters = {
        ...initialState.activeFilters,
        distance: state.activeFilters.distance, // Keep the current distance
      };
      state.page = 1;
      state.hasMore = true;
      state.matches = []; // Clear displayed matches
      state.professionalMatches = []; // Clear stored professional matches
      state.MosqueZawajes = []; // Clear stored mosque matches
      state.activeFilters.selectedMosques = []; // Ensure selectedMosques is cleared
    },
    clearMatches: (state) => {
      state.matches = [];
      state.selectedMatch = null;
      state.page = 1;
      state.hasMore = true;
      state.professionalMatches = []; // Also clear professional matches when explicitly clearing all
      state.MosqueZawajes = []; // Also clear mosque matches
    },
    addInterestLocal: (state, action) => {
      // Assuming payload is the full user object, not just ID
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
    // New Reducer: Sets the search mode and updates 'matches' accordingly
    setSearchMode: (state, action) => {
      const newMode = action.payload;
      state.searchMode = newMode;
      if (newMode === "professional") {
        state.matches = [...state.professionalMatches];
        state.activeFilters.selectedMosques = [];
        state.MosqueZawajes = [];
      } else {
        // newMode === 'mosque'
        // When switching to mosque mode, if there are already selected mosques, display their matches.
        // Otherwise, clear matches to show a blank slate for new mosque selection.
        if (
          state.activeFilters.selectedMosques.length > 0 &&
          state.MosqueZawajes.length > 0
        ) {
          state.matches = [...state.MosqueZawajes];
        } else {
          state.matches = [];
        }
      }
    },
    initializeDefaultMosques: (state, action) => {
      const defaultMosques = action.payload;
      state.activeFilters.selectedMosques = defaultMosques;
      state.MosqueZawajes = []; // Clear to force fresh fetch
      if (state.searchMode === "mosque") {
        state.matches = [];
      }
    },
    addSearchedMosque: (state, action) => {
      const mosqueId = action.payload;
      if (!state.searchedMosques.includes(mosqueId)) {
        state.searchedMosques.push(mosqueId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        const matchesData = Array.isArray(action.payload) ? action.payload : [];
        state.professionalMatches = matchesData; // Store results in professionalMatches
        if (state.searchMode === "professional") {
          state.matches = matchesData; // Only update displayed matches if in professional mode
        }
        state.loading = false;
        state.hasMore = matchesData.length === 10;
        state.page = 1; // Always reset page to 1 for new professional search
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.professionalMatches = []; // Clear professional matches on error
        if (state.searchMode === "professional") {
          state.matches = []; // Clear displayed matches if in professional mode
        }
      })
      .addCase(loadMoreMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMoreMatches.fulfilled, (state, action) => {
        const newMatches = Array.isArray(action.payload) ? action.payload : [];
        // loadMore only applies to professional search
        state.professionalMatches = [
          ...state.professionalMatches,
          ...newMatches,
        ];
        if (state.searchMode === "professional") {
          state.matches = [...state.matches, ...newMatches];
        }
        state.loading = false;
        state.page += 1;
        state.hasMore = newMatches.length === 10;
      })
      .addCase(loadMoreMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasMore = false;
      })
      .addCase(fetchMatchesByMosque.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Don't clear matches or MosqueZawajes here, as we are accumulating.
        // Clearing will happen via `updateFilters` or `removeFilter`
        // before this thunk is dispatched if a mosque selection changes.
      })
      .addCase(fetchMatchesByMosque.fulfilled, (state, action) => {
        const matchesData = action.payload.matches || action.payload;
        const newMatches = Array.isArray(matchesData) ? matchesData : [];
        const mosqueId = action.payload.mosqueId;
        const mosqueName = action.payload.mosqueName;

        // Ensure selectedMosques array exists
        if (!state.activeFilters.selectedMosques) {
          state.activeFilters.selectedMosques = [];
        }

        // Add mosque to selectedMosques if not already present
        const existingMosqueInFilter = state.activeFilters.selectedMosques.find(
          (m) => m.id === mosqueId
        );
        if (!existingMosqueInFilter) {
          state.activeFilters.selectedMosques.push({
            id: mosqueId,
            name: mosqueName,
          });
        }

        // Accumulate matches into MosqueZawajes, avoiding duplicates based on _id
        const existingIdsInMosqueZawajes = new Set(
          state.MosqueZawajes.map((m) => m._id)
        );
        const uniqueNewMatches = newMatches.filter(
          (m) => !existingIdsInMosqueZawajes.has(m._id)
        );

        state.MosqueZawajes = [...state.MosqueZawajes, ...uniqueNewMatches];

        // Only update displayed matches if in mosque search mode
        if (state.searchMode === "mosque") {
          state.matches = [...state.MosqueZawajes]; // Display all accumulated mosque matches
        }

        state.loading = false;

        if (!state.searchedMosques.includes(mosqueId)) {
          state.searchedMosques.push(mosqueId);
        }
      })
      .addCase(fetchMatchesByMosque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Do NOT clear MosqueZawajes here. The error might be for one specific fetch
        // but other mosque's data might still be valid.
        // Clearing of MosqueZawajes should be managed by updateFilters/removeFilter
        // when the selection changes, or clearAllFilters.
        // state.matches = []; // Don't clear unless explicitly removing all selected mosques
      })
      .addCase(fetchUserInterests.fulfilled, (state, action) => {
        state.userInterests = action.payload;
      })
      .addCase(addInterest.fulfilled, (state, action) => {
        // The payload is the femaleId that was successfully interested in
        const interestedFemaleId = action.payload;

        // Update professionalMatches
        const professionalMatch = state.professionalMatches.find(
          (match) => match._id === interestedFemaleId
        );
        if (professionalMatch) {
          professionalMatch.isInterested = true;
        }

        // Update MosqueZawajes
        const MosqueZawaj = state.MosqueZawajes.find(
          (match) => match._id === interestedFemaleId
        );
        if (MosqueZawaj) {
          MosqueZawaj.isInterested = true;
        }

        // Update the currently displayed matches (which could be either)
        const displayedMatch = state.matches.find(
          (match) => match._id === interestedFemaleId
        );
        if (displayedMatch) {
          displayedMatch.isInterested = true;
        }

        // Add to userInterests list, if it's not already there (assuming userInterests stores IDs or full objects)
        if (!state.userInterests.includes(interestedFemaleId)) {
          // Assuming userInterests stores IDs
          state.userInterests.push(interestedFemaleId);
        }
      })
      .addCase(removeInterest.fulfilled, (state, action) => {
        // The payload is the femaleId that was successfully de-interested from
        const deinterestedFemaleId = action.payload;

        // Update professionalMatches
        const professionalMatch = state.professionalMatches.find(
          (match) => match._id === deinterestedFemaleId
        );
        if (professionalMatch) {
          professionalMatch.isInterested = false;
        }

        // Update MosqueZawajes
        const MosqueZawaj = state.MosqueZawajes.find(
          (match) => match._id === deinterestedFemaleId
        );
        if (MosqueZawaj) {
          MosqueZawaj.isInterested = false;
        }

        // Update the currently displayed matches
        const displayedMatch = state.matches.find(
          (match) => match._id === deinterestedFemaleId
        );
        if (displayedMatch) {
          displayedMatch.isInterested = false;
        }

        // Remove from userInterests list
        state.userInterests = state.userInterests.filter(
          (item) => item !== deinterestedFemaleId
        ); // Assuming userInterests stores IDs
      })
      .addCase(initializeUserMosques.fulfilled, (state, action) => {
        const defaultMosques = action.payload;
        // Only set default mosques if in mosque mode and no mosques are currently selected
        if (
          state.searchMode === "mosque" &&
          state.activeFilters.selectedMosques.length === 0
        ) {
          state.activeFilters.selectedMosques = defaultMosques;
          state.MosqueZawajes = []; // Clear to trigger fresh fetch
          state.matches = [];
        }
      })
      .addCase(saveMosqueFilters.fulfilled, (state, action) => {
        state.hasSavedFilters = true;
      })
      .addCase(loadMosqueFilters.fulfilled, (state, action) => {
        const savedMosques = action.payload;
        state.activeFilters.selectedMosques = savedMosques;
        state.hasSavedFilters = savedMosques.length > 0;
        state.MosqueZawajes = [];
        if (state.searchMode === "mosque") {
          state.matches = [];
        }
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
  setSearchMode,
  addSearchedMosque,
  initializeDefaultMosques,
} = matchSlice.actions;

export default matchSlice.reducer;
