// redux/form/formSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStep: 1,
  formData: {
    // Basic info
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",

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
};

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
  },
});

export const {
  setStep,
  updateFormData,
  resetForm,
  attachMosque,
  detachMosque,
  setDistance,
} = formSlice.actions;

export default formSlice.reducer;
