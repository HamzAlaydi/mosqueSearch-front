// frontend/src/features/form/formSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../auth/authAPI"; // Assuming you have this defined
import { rootRoute } from "@/shared/constants/backendLink"; // Assuming this is your backend base URL
import { isNil } from "lodash";

const initialState = {
  currentStep: 1,
  formData: {
    // Basic info
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    role: "",

    // Wali information (for female users)
    waliName: "",
    waliPhone: "",
    waliEmail: "",

    // Education & Language
    educationLevel: "",
    profession: "",
    jobTitle: "",
    firstLanguage: "",
    secondLanguage: "",

    // Religious info
    religiousness: "",
    sector: "",
    isRevert: false,
    keepsHalal: false,
    prayerFrequency: "",
    quranReading: "",

    // Location & Financial
    citizenship: "",
    originCountry: "",
    willingToRelocate: false,
    income: "",
    marriageWithin: "",

    // Family
    maritalStatus: "",
    childrenDesire: "",
    hasChildren: "",
    livingArrangement: "",
    height: "",

    // Physical & Habits
    build: "",
    ethnicity: "",
    smokes: false,
    drinks: false,
    disability: false,
    phoneUsage: "",

    // Gender-specific attributes
    hasBeard: false,
    wearsHijab: false,

    // Location
    currentLocation: "",
    countryOfBirth: "",
    birthDate: "",

    // Profile content
    tagLine: "",
    about: "",
    lookingFor: "",

    // Profile picture
    profilePicture: null,
    profilePicturePreview: "",
    terms: false,

    // Mosque attachment
    distance: 6, // Default 6 miles
    attachedMosques: [],
  },
  successMessage: "",
  error: null,
  loading: false, // Add a loading state
};

// Improved Thunk with correct API interaction
export const submitRegistration = createAsyncThunk(
  "form/submitRegistration",
  async (values, { dispatch, getState }) => {
    try {
      const state = getState();
      const finalData = { ...state.form.formData, ...values };

      // Structure wali data correctly
      const waliData = {
        name: finalData.waliName,
        phone: finalData.waliPhone,
        email: finalData.waliEmail,
      };

      const formattedMosques = finalData.attachedMosques.map((mosque) => ({
        id: mosque.id,
        name: mosque.name,
        address: mosque.address,
        location: {
          type: "Point",
          coordinates: [mosque.location.lng, mosque.location.lat],
        },
      }));

      const payloadToSend = {
        ...finalData,
        wali: waliData, // Nest wali data
        attachedMosques: formattedMosques,
      };

      // Remove unnecessary fields
      delete payloadToSend.waliName;
      delete payloadToSend.waliPhone;
      delete payloadToSend.waliEmail;
      delete payloadToSend.profilePicturePreview;

      const response = await dispatch(
        authAPI.endpoints.signup.initiate({
          url: `${rootRoute}/auth/register`,
          body: payloadToSend,
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).unwrap();

      return { message: response?.message || "Signup successful" };
    } catch (error) {
      return {
        error: error?.data?.errors || error?.data?.message || "Signup failed",
      };
    }
  }
);

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.currentStep = 1;
      state.formData = initialState.formData;
      state.successMessage = "";
      state.error = null;
      state.loading = false; // Reset loading state as well
    },
    attachMosque: (state, action) => {
      const mosque = action.payload;
      const existingIndex = state.formData.attachedMosques.findIndex(
        (m) => m.id === mosque.id
      );
      if (existingIndex === -1) {
        state.formData.attachedMosques.push(mosque);
      }
    },
    detachMosque: (state, action) => {
      const mosqueId = action.payload;
      state.formData.attachedMosques = state.formData.attachedMosques.filter(
        (mosque) => mosque.id !== mosqueId
      );
    },
    setDistance: (state, action) => {
      state.formData.distance = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRegistration.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
        state.successMessage = ""; // Clear any previous success messages
      })
      .addCase(submitRegistration.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.message) {
          state.successMessage = action.payload.message;
          state.currentStep = 1;
          state.formData = initialState.formData;
        }
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Signup failed unexpectedly.";
      });
  },
});

export const {
  setStep,
  updateFormData,
  resetForm,
  attachMosque,
  detachMosque,
  setDistance,
  clearError, // Export the new action
  clearSuccessMessage, // Export the new action
} = formSlice.actions;

// Selector to get the current step
export const selectCurrentStep = (state) => state.form.currentStep;

// Selector to get the entire form data
export const selectFormData = (state) => state.form.formData;

// Selector to get the success message
export const selectSuccessMessage = (state) => state.form.successMessage;

// Selector to get the error
export const selectFormError = (state) => state.form.error;

// Selector to get the loading state
export const selectFormLoading = (state) => state.form.loading;

export default formSlice.reducer;
