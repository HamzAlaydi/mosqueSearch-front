import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import LocationSelect from "@/components/common/LocationSelect";
import LanguageSelect from "@/components/common/LanguageSelect";

// Step 1 Validation schema
const imamSignupStep1Schema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\s()-]{8,20}$/, "Please enter a valid phone number"),
  message: Yup.string().max(500, "Message cannot exceed 500 characters"),
  languages: Yup.array()
    .min(1, "Please select at least one language")
    .required("Languages spoken is required"),
  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match")
    .required("Please confirm your password"),
  terms: Yup.boolean()
    .required("Terms and conditions")
    .oneOf([true], "You must accept the terms and conditions"),
});

const ImamSignupStep1 = ({ onSubmit, formData }) => {
  const initialValues = {
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    message: formData.message || "",
    languages: formData.languages || [],
    password: formData.password || "",
    confirmPassword: formData.confirmPassword || "",
    terms: formData.terms || false,
    role: "imam",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={imamSignupStep1Schema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue, values, isSubmitting }) => (
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

          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <Field
              type="tel"
              name="phone"
              id="phone"
              className="form-input"
              placeholder="Enter your phone number"
            />
            <ErrorMessage
              name="phone"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Languages Spoken*</label>
            <LanguageSelect
              name="languages"
              value={values.languages}
              onChange={setFieldValue}
              placeholder="Select languages you speak"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <Field
              name="message"
              as="textarea"
              rows="3"
              className="form-input"
              placeholder="Add a message for the community"
            />
            <ErrorMessage
              name="message"
              component="div"
              className="error-message"
            />
          </div>

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

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="terms"
              id="terms"
              className="form-checkbox"
            />
            <label htmlFor="terms" className="form-checkbox-label">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
            <ErrorMessage
              name="terms"
              component="div"
              className="error-message"
            />
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Next"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ImamSignupStep1;
