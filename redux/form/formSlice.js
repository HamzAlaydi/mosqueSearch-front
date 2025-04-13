// redux/form/formSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    // Basic info
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    
    // Education & language
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
    
    // Location
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
    
    // Physical
    build: "",
    ethnicity: "",
    smokes: false,
    drinks: false,
    disability: false,
    phoneUsage: "",
    
    // About you
    currentLocation: "",
    countryOfBirth: "",
    birthDate: "",
    tagLine: "",
    about: "",
    lookingFor: "",
    
    // Profile picture
    profilePicture: null,
    profilePicturePreview: "",
    terms: false,
  },
  currentStep: 1,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
    },
    resetForm: () => initialState,
  },
});

export const { updateFormData, setStep, nextStep, prevStep, resetForm } = formSlice.actions;

export default formSlice.reducer;