// shared/constants/validationSchemas.js
import * as Yup from "yup";

export const basicInfoSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  gender: Yup.string().required("Gender selection is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  waliEmail: Yup.string().when("gender", {
    is: "female",
    then: (schema) =>
      schema
        .email("Please enter a valid email address")
        .required("Wali email is required"), // Required for females
    otherwise: (schema) => schema.notRequired(),
  }),
  waliName: Yup.string().when("gender", {
    is: "female",
    then: (schema) => schema, // Optional
    otherwise: (schema) => schema.notRequired(),
  }),
  waliPhone: Yup.string().when("gender", {
    is: "female",
    then: (schema) => schema, // Optional
    otherwise: (schema) => schema.notRequired(),
  }),
  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match")
    .required("Please confirm your password"),
});
// Rest of the validation schemas remain the same

export const educationSchema = Yup.object().shape({
  educationLevel: Yup.string(),
  profession: Yup.string(),
  firstLanguage: Yup.string().required("Primary language is required"),
  secondLanguage: Yup.string(),
});

export const religiousInfoSchema = Yup.object().shape({
  religiousness: Yup.string(),
  sector: Yup.string().required("Religious affiliation is required"),
  isRevert: Yup.boolean(),
  keepsHalal: Yup.boolean(),
  prayerFrequency: Yup.string(),
  quranReading: Yup.string(),
});

export const locationSchema = Yup.object().shape({
  citizenship: Yup.string().required("Citizenship information is required"),
  originCountry: Yup.string().required("Country of origin is required"),
  willingToRelocate: Yup.boolean(),
  income: Yup.string(),
  marriageWithin: Yup.string(),
});

export const familySchema = Yup.object().shape({
  maritalStatus: Yup.string(),
  childrenDesire: Yup.string(),
  hasChildren: Yup.string(),
  livingArrangement: Yup.string(),
  height: Yup.string(),
});

export const physicalSchema = Yup.object().shape({
  build: Yup.string(),
  ethnicity: Yup.string().required("Ethnic background is required"),
  smokes: Yup.boolean(),
  drinks: Yup.boolean(),
  disability: Yup.boolean(),
  phoneUsage: Yup.string(),
});

export const finalStepSchema = Yup.object().shape({
  profilePicture: Yup.mixed().nullable(), // Changed to explicitly allow null
  terms: Yup.boolean().required(
    "Acceptance of terms and conditions is required"
  ),
});

export const additionalInfoSchema = Yup.object().shape({
  currentLocation: Yup.string().required("Current location is required"),
  countryOfBirth: Yup.string().required("Country of birth is required"),
  birthDate: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Birth date cannot be in the future"),
  tagLine: Yup.string().max(100, "Tagline cannot exceed 100 characters"),
  about: Yup.string().max(500, "About section cannot exceed 500 characters"),
  lookingFor: Yup.string().max(
    500,
    "Looking for section cannot exceed 500 characters"
  ),
});


export const mosqueSelectionSchema = Yup.object().shape({
  distance: Yup.number()
    .required("Distance is required")
    .min(1, "Distance must be at least 1 mile")
    .max(30, "Distance cannot exceed 30 miles"),
  attachedMosques: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        name: Yup.string().required(),
        address: Yup.string().required(),
        location: Yup.object().shape({
          lat: Yup.number().required(),
          lng: Yup.number().required(),
        }),
      })
    )
    .min(5, "Please select at least 5 mosques")
    .required("Mosque selection is required"),
});

export const signupSchema = Yup.object().shape({
  ...basicInfoSchema.fields,
  ...educationSchema.fields,
  ...religiousInfoSchema.fields,
  ...locationSchema.fields,
  ...familySchema.fields,
  ...physicalSchema.fields,
  ...finalStepSchema.fields,
  ...additionalInfoSchema.fields,
  ...mosqueSelectionSchema.fields,
});
