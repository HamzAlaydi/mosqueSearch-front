// components/auth/signup/SignupStep1.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState, useEffect } from "react";
import { basicInfoSchema } from "@/shared/constants/validationSchemas";

const SignupStep1 = ({ nextStep, formData }) => {
  const [showWaliEmail, setShowWaliEmail] = useState(
    formData.gender === "female"
  );

  // Update schema based on initial formData
  const validationSchema = basicInfoSchema;

  return (
    <Formik
      initialValues={{
        gender: formData.gender || "",
        email: formData.email || "",
        waliEmail: formData.waliEmail || "",
        password: formData.password || "",
        confirmPassword: formData.confirmPassword || "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => {
        // Show/hide wali email field when gender changes
        useEffect(() => {
          setShowWaliEmail(values.gender === "female");
          if (values.gender !== "female") {
            setFieldValue("waliEmail", "");
          }
        }, [values.gender, setFieldValue]);

        return (
          <Form className="auth-form">
            <div className="form-group">
              <label htmlFor="gender">Gender*</label>
              <Field
                as="select"
                name="gender"
                id="gender"
                className="form-input"
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Field>
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
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error-message"
              />
            </div>

            {showWaliEmail && (
              <div className="form-group">
                <label htmlFor="waliEmail">Wali Email Address*</label>
                <Field
                  type="email"
                  name="waliEmail"
                  id="waliEmail"
                  className="form-input"
                  placeholder="Enter your wali's email"
                />
                <ErrorMessage
                  name="waliEmail"
                  component="div"
                  className="error-message"
                />
              </div>
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
        );
      }}
    </Formik>
  );
};

export default SignupStep1;
