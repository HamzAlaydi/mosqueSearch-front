"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState, useMemo, useCallback } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import AsyncSelect from "react-select/async";
import { countries } from "@/shared/constants/signupData";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import debounce from 'lodash.debounce';

const animatedComponents = makeAnimated();

const SignupStep7 = ({ nextStep, prevStep, formData }) => {
  const [birthDate, setBirthDate] = useState(
    formData.birthDate ? dayjs(formData.birthDate) : null
  );

  // Memoize the country options to prevent unnecessary re-renders
  const countryOptions = useMemo(() => countries, []);

  // Debounce the location search function
  const loadOptions = useCallback(debounce((inputValue, callback) => {
    if (inputValue.length < 3) {
      callback([]);
      return;
    }
    
    fetch(
      `https://api.locationiq.com/v1/autocomplete?key=pk.288b6dab564970e7a979efef12013f91&q=${inputValue}`
    )
      .then((response) => response.json())
      .then((data) => {
        callback(
          data.map((item) => ({
            value: item.place_id,
            label: item.display_name,
          }))
        );
      })
      .catch(() => callback([]));
  }, 500), []);

  // Get current location value for AsyncSelect
  const currentLocationValue = useMemo(() => {
    return formData.currentLocation 
      ? { value: formData.currentLocation, label: formData.currentLocation }
      : null;
  }, [formData.currentLocation]);

  // Get country of birth value for Select
  const countryOfBirthValue = useMemo(() => {
    return countryOptions.find(opt => opt.value === formData.countryOfBirth);
  }, [formData.countryOfBirth, countryOptions]);

  return (
    <Formik
      initialValues={{
        currentLocation: formData.currentLocation || "",
        countryOfBirth: formData.countryOfBirth || "",
        birthDate: formData.birthDate || "",
        tagLine: formData.tagLine || "",
        about: formData.about || "",
        lookingFor: formData.lookingFor || "",
      }}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Where do you live?</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              value={currentLocationValue}
              onChange={(option) => {
                setFieldValue("currentLocation", option?.label || "");
              }}
              placeholder="Start typing your location..."
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={({ inputValue }) => 
                inputValue.length < 3 
                  ? "Type at least 3 characters to search" 
                  : "No locations found"
              }
              loadingMessage={() => "Searching..."}
            />
          </div>

          <div className="form-group">
            <label>Country of Birth</label>
            <Select
              options={countryOptions}
              value={countryOfBirthValue}
              onChange={(option) =>
                setFieldValue("countryOfBirth", option?.value || "")
              }
              placeholder="Select country of birth"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Birth"
                value={birthDate}
                onChange={(date) => {
                  setBirthDate(date);
                  setFieldValue("birthDate", date ? date.toISOString() : "");
                }}
                format="DD/MM/YYYY"
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>
          </div>

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

export default SignupStep7;