// components/auth/signup/SignupStep2.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState, useMemo } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CountrySelect from "@/components/common/CountrySelect";
import LocationSelect from "@/components/common/LocationSelect";
import { additionalInfoSchema } from "@/shared/constants/validationSchemas";

const SignupStep2 = ({ nextStep, prevStep, formData }) => {
  const [birthDate, setBirthDate] = useState(
    formData.birthDate ? dayjs(formData.birthDate) : null
  );

  // Gender-specific fields
  const isGenderMale = formData.gender === "male";

  return (
    <Formik
      initialValues={{
        currentLocation: formData.currentLocation || "",
        countryOfBirth: formData.countryOfBirth || "",
        birthDate: formData.birthDate || "",
        tagLine: formData.tagLine || "",
        about: formData.about || "",
        lookingFor: formData.lookingFor || "",
        // Gender-specific fields
        hasBeard: isGenderMale ? formData.hasBeard || false : false,
      }}
      validationSchema={additionalInfoSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Where do you live?*</label>
            <LocationSelect
              name="currentLocation"
              value={values.currentLocation}
              onChange={setFieldValue}
              placeholder="Start typing your location..."
              isRequired={true}
            />
            <ErrorMessage
              name="currentLocation"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Country of Birth*</label>
            <CountrySelect
              name="countryOfBirth"
              value={values.countryOfBirth}
              onChange={setFieldValue}
              placeholder="Select country of birth"
              isRequired={true}
            />
            <ErrorMessage
              name="countryOfBirth"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Date of Birth*</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={birthDate}
                onChange={(date) => {
                  setBirthDate(date);
                  setFieldValue("birthDate", date ? date.toISOString() : "");
                }}
                format="DD/MM/YYYY"
                maxDate={dayjs()}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    height: "42px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "DD/MM/YYYY",
                    className: "form-input date-input",
                  },
                }}
              />
            </LocalizationProvider>
            <ErrorMessage
              name="birthDate"
              component="div"
              className="error-message"
            />
          </div>

          {/* Gender-specific questions */}
          {isGenderMale && (
            <div className="form-checkbox-group">
              <Field
                type="checkbox"
                name="hasBeard"
                id="hasBeard"
                className="form-checkbox"
              />
              <label htmlFor="hasBeard">Do you have a beard?</label>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tagLine">Tag Line</label>
            <Field
              name="tagLine"
              as="textarea"
              rows="1"
              className="form-input"
              placeholder="A short tagline about yourself"
            />
          </div>

          <div className="form-group">
            <label htmlFor="about">A Little About You</label>
            <Field
              name="about"
              as="textarea"
              rows="3"
              className="form-input"
              placeholder="Describe yourself in a few sentences"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lookingFor">What I'm Looking For</label>
            <Field
              name="lookingFor"
              as="textarea"
              rows="3"
              className="form-input"
              placeholder="Describe what you're looking for in a partner"
            />
          </div>

          <div className="form-navigation">
            <button
              type="button"
              onClick={prevStep}
              className="auth-button secondary"
            >
              Previous
            </button>
            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              Next
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignupStep2;
