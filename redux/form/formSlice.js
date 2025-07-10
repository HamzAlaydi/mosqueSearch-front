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

      // Check if we have a profile picture
      const hasProfilePicture = finalData.profilePicture instanceof File;

      if (hasProfilePicture) {
        // Use FormData for file upload
        const formData = new FormData();

        // Add all text fields to FormData
        Object.keys(finalData).forEach((key) => {
          if (key === "profilePicture" && finalData[key] instanceof File) {
            // Handle file upload
            console.log("Adding profile picture to FormData:", finalData[key]);
            formData.append("profilePicture", finalData[key]);
          } else if (key === "attachedMosques") {
            // Handle array data
            formData.append(
              "attachedMosques",
              JSON.stringify(formattedMosques)
            );
          } else if (
            key !== "profilePicturePreview" &&
            key !== "waliName" &&
            key !== "waliPhone" &&
            key !== "waliEmail"
          ) {
            // Handle all other fields
            if (typeof finalData[key] === "object") {
              formData.append(key, JSON.stringify(finalData[key]));
            } else {
              // Special handling for specific fields
              if (key === "terms") {
                // Terms must be boolean for backend validation
                formData.append(
                  key,
                  finalData[key] === true || finalData[key] === "true"
                );
              } else if (typeof finalData[key] === "boolean") {
                // Other boolean values as strings
                formData.append(key, finalData[key].toString());
              } else {
                formData.append(key, finalData[key]);
              }
            }
          }
        });

        // Add wali data as nested object structure (as backend expects)
        if (finalData.waliName || finalData.waliPhone || finalData.waliEmail) {
          const waliObject = {
            name: finalData.waliName || "",
            phone: finalData.waliPhone || "",
            email: finalData.waliEmail || "",
          };
          formData.append("wali", JSON.stringify(waliObject));
        }

        // Debug: Log FormData contents
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // Log the final data structure being sent
        console.log("Final data structure:", {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          password: finalData.password,
          gender: finalData.gender,
          role: finalData.role,
          terms: finalData.terms,
          wali: finalData.waliName
            ? {
                name: finalData.waliName,
                phone: finalData.waliPhone,
                email: finalData.waliEmail,
              }
            : null,
        });

        console.log("Sending signup request with FormData...");
        const response = await dispatch(
          authAPI.endpoints.signup.initiate({
            url: `${rootRoute}/auth/register`,
            body: formData,
          })
        ).unwrap();

        console.log("Signup response:", response);
        return { message: response?.message || "Signup successful" };
      } else {
        // Use JSON for non-file uploads
        const payloadToSend = {
          ...finalData,
          attachedMosques: formattedMosques,
        };

        // Add wali data as nested object structure (as backend expects)
        if (finalData.waliName || finalData.waliPhone || finalData.waliEmail) {
          payloadToSend.wali = {
            name: finalData.waliName || "",
            phone: finalData.waliPhone || "",
            email: finalData.waliEmail || "",
          };
        }

        // Remove unnecessary fields
        delete payloadToSend.waliName;
        delete payloadToSend.waliPhone;
        delete payloadToSend.waliEmail;
        delete payloadToSend.profilePicturePreview;

        console.log("Sending signup request with JSON...");
        const response = await dispatch(
          authAPI.endpoints.signup.initiate({
            url: `${rootRoute}/auth/register`,
            body: payloadToSend,
            headers: {
              "Content-Type": "application/json",
            },
          })
        ).unwrap();

        console.log("Signup response:", response);
        return { message: response?.message || "Signup successful" };
      }
    } catch (error) {
      console.error("Signup error details:", {
        error: error,
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      return {
        error:
          error?.data?.errors ||
          error?.data?.message ||
          error?.message ||
          "Signup failed",
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
