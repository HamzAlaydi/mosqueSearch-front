// components/auth/signup/SignupStep1.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { basicInfoSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { genderOptions } from "@/shared/constants/signupData";
import { useId, useState } from "react";
import { useCheckEmailMutation } from "@/redux/auth/authAPI";

const animatedComponents = makeAnimated();

const SignupStep1 = ({ nextStep, formData }) => {
  const instanceId = useId();
  const [checkEmail, { isLoading: isCheckingEmail }] = useCheckEmailMutation();
  const [emailError, setEmailError] = useState("");

  // Custom validation function for email
  const validateEmail = async (email) => {
    if (!email) return "Email address is required";
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    try {
      const result = await checkEmail(email).unwrap();
      if (result.exists) {
        setEmailError("This email address is already registered");
        return "This email address is already registered";
      } else {
        setEmailError("");
        return undefined; // No error
      }
    } catch (error) {
      console.error("Email validation error:", error);
      return "Error checking email availability. Please try again.";
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        gender: formData.gender || "",
        email: formData.email || "",
        waliEmail: formData.waliEmail || "",
        waliName: formData.waliName || "",
        waliPhone: formData.waliPhone || "",
        password: formData.password || "",
        confirmPassword: formData.confirmPassword || "",
        role: formData.role || "",
      }}
      validationSchema={basicInfoSchema}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        // Validate email before proceeding
        const emailValidationError = await validateEmail(values.email);
        if (emailValidationError) {
          setFieldError("email", emailValidationError);
          setSubmitting(false);
          return;
        }

        // If email is valid, proceed to next step
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting, setFieldError }) => (
        <Form className="auth-form">
          {/* First Name and Last Name in the same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <Field
                type="text"
                name="firstName"
                id="firstName"
                className="form-input"
                placeholder="Enter your first name"
              />
              <ErrorMessage
                name="firstName"
                component="div"
                className="error-message"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <Field
                type="text"
                name="lastName"
                id="lastName"
                className="form-input"
                placeholder="Enter your last name"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="error-message"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gender*</label>
            <Select
              instanceId={instanceId}
              options={genderOptions}
              value={genderOptions.find((opt) => opt.value === values.gender)}
              onChange={(option) => {
                setFieldValue("gender", option.value);
                setFieldValue("role", option.value);
              }}
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
              onBlur={async (e) => {
                const email = e.target.value;
                if (email) {
                  const error = await validateEmail(email);
                  if (error) {
                    setFieldError("email", error);
                  }
                }
              }}
            />
            <ErrorMessage
              name="email"
              component="div"
              className={
                emailError
                  ? "bg-red-50 border border-red-300 text-red-700 rounded-md px-3 py-2 mt-2 text-sm font-medium shadow-sm"
                  : "error-message"
              }
            />
            {isCheckingEmail && (
              <div className="bg-green-50 border border-green-300 text-green-700 rounded-md px-3 py-2 mt-2 text-sm font-medium shadow-sm">
                Checking email availability...
              </div>
            )}
          </div>

          {values.gender === "female" && (
            <>
              <div className="form-group">
                <label htmlFor="waliName">Wali Name</label>
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
                <label htmlFor="waliPhone">Wali Phone Number</label>
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
                <label htmlFor="waliEmail">Wali Email*</label>
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
              disabled={isSubmitting || isCheckingEmail}
            >
              {isSubmitting ? "Validating..." : "Next"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignupStep1;
