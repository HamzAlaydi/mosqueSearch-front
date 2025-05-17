import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import LocationSelect from "@/components/common/LocationSelect";
import LanguageSelect from "@/components/common/LanguageSelect";

// Step 1 Validation schema
const imamSignupStep1Schema = Yup.object().shape({
  imamName: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\s()-]{8,20}$/, "Please enter a valid phone number"),
  mosqueAddress: Yup.string().required("Mosque address is required"),
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
    imamName: formData.imamName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    mosqueAddress: formData.mosqueAddress || "",
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
          <div className="form-group">
            <label htmlFor="imamName">Full Name*</label>
            <Field
              type="text"
              name="imamName"
              id="imamName"
              className="form-input"
              placeholder="Enter your full name"
            />
            <ErrorMessage
              name="imamName"
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
            <label>Mosque Address*</label>
            <LocationSelect
              name="mosqueAddress"
              value={values.mosqueAddress}
              onChange={(name, value, details) => {
                setFieldValue(name, value);
                setFieldValue("mosqueLocation", details?.location || null);
              }}
              placeholder="Enter mosque address"
              isRequired={true}
            />
            <ErrorMessage
              name="mosqueAddress"
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
            <label htmlFor="terms">
              I agree to the{" "}
              <Link href="/terms" className="auth-link">
                Terms & Conditions
              </Link>
            </label>
          </div>
          <ErrorMessage
            name="terms"
            component="div"
            className="error-message"
          />

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

export default ImamSignupStep1;
