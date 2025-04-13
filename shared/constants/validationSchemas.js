// shared/constants/validationSchemas.js
import * as Yup from "yup";

export const basicInfoSchema = Yup.object().shape({
  gender: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

export const educationSchema = Yup.object().shape({
  educationLevel: Yup.string().required("Required"),
  profession: Yup.string().required("Required"),
  jobTitle: Yup.string().required("Required"),
  firstLanguage: Yup.string().required("Required"),
  secondLanguage: Yup.string(),
});

export const religiousInfoSchema = Yup.object().shape({
  religiousness: Yup.string().required("Required"),
  sector: Yup.string(),
  isRevert: Yup.boolean(),
  keepsHalal: Yup.boolean(),
  prayerFrequency: Yup.string().required("Required"),
  quranReading: Yup.string().required("Required"),
});

export const locationSchema = Yup.object().shape({
  citizenship: Yup.string().required("Required"),
  originCountry: Yup.string().required("Required"),
  willingToRelocate: Yup.boolean(),
  income: Yup.string().required("Required"),
  marriageWithin: Yup.string(),
});

export const familySchema = Yup.object().shape({
  maritalStatus: Yup.string().required("Required"),
  childrenDesire: Yup.string().required("Required"),
  hasChildren: Yup.string(),
  livingArrangement: Yup.string().required("Required"),
  height: Yup.string(),
});

export const physicalSchema = Yup.object().shape({
  build: Yup.string(),
  ethnicity: Yup.string().required("Required"),
  smokes: Yup.boolean(),
  drinks: Yup.boolean(),
  disability: Yup.boolean(),
  phoneUsage: Yup.string(),
});

export const finalStepSchema = Yup.object().shape({
  profilePicture: Yup.mixed(),
  terms: Yup.boolean().required("You must accept the terms"),
});

export const additionalInfoSchema = Yup.object().shape({
  currentLocation: Yup.string().required("Required"),
  countryOfBirth: Yup.string().required("Required"),
  birthDate: Yup.date()
    .required("Required")
    .max(new Date(), "Birth date cannot be in the future"),
  tagLine: Yup.string().max(100, "Tag line must be 100 characters or less"),
  about: Yup.string().required("Required").max(500, "Maximum 500 characters"),
  lookingFor: Yup.string()
    .required("Required")
    .max(500, "Maximum 500 characters"),
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
});
