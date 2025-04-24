// components/auth/signup/SignupStep1.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { basicInfoSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { genderOptions } from "@/shared/constants/signupData";
import { useId } from "react";
const animatedComponents = makeAnimated();

const SignupStep1 = ({ nextStep, formData }) => {
  const instanceId = useId();
  return (
    <Formik
      initialValues={{
        gender: formData.gender || "",
        email: formData.email || "",
        waliEmail: formData.waliEmail || "",
        waliName: formData.waliName || "",
        waliPhone: formData.waliPhone || "",
        password: formData.password || "",
        confirmPassword: formData.confirmPassword || "",
      }}
      validationSchema={basicInfoSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Gender*</label>
            <Select
              instanceId={instanceId}
              options={genderOptions}
              value={genderOptions.find((opt) => opt.value === values.gender)}
              onChange={(option) => setFieldValue("gender", option.value)}
              components={animatedComponents}
              placeholder="Select your gender"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="gender"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <Field
              type="email"
              name="email"
              id="email"
              className="form-input"
              placeholder="Enter your email address"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="error-message"
            />
          </div>

          {values.gender === "female" && (
            <>
              <div className="form-group">
                <label htmlFor="waliName">Wali Name</label> {/* Optional */}
                <Field
                  type="text"
                  name="waliName"
                  id="waliName"
                  className="form-input"
                  placeholder="Enter your wali's name (optional)"
                />
                <ErrorMessage
                  name="waliName"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="waliPhone">Wali Phone Number</label>{" "}
                {/* Optional */}
                <Field
                  type="tel"
                  name="waliPhone"
                  id="waliPhone"
                  className="form-input"
                  placeholder="Enter your wali's phone number (optional)"
                />
                <ErrorMessage
                  name="waliPhone"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="waliEmail">Wali Email*</label> {/* Required */}
                <Field
                  type="email"
                  name="waliEmail"
                  id="waliEmail"
                  className="form-input"
                  placeholder="Enter your wali's email address"
                  required
                />
                <ErrorMessage
                  name="waliEmail"
                  component="div"
                  className="error-message"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <Field
              type="password"
              name="password"
              id="password"
              className="form-input"
              placeholder="Create a password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <Field
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
            />
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-navigation">
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

export default SignupStep1;
